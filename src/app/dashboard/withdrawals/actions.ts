'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { BazikService } from "@/lib/server/bazik/bazik.service";
import { canCreateWithdrawal } from "@/lib/server/access";
import speakeasy from 'speakeasy';

export async function requestWithdrawal(amount: number, method: string, receiver?: string, code2fa?: string, _unused?: any, saveNumber?: boolean) {
  const { user, merchant, userRole, supabase } = await getCurrentUserAndMerchant();

  if (!merchant) {
    return { error: "Merchant not found" };
  }

  if (userRole !== 'owner') {
    return { error: "Accès refusé. Seul le propriétaire peut effectuer des retraits." };
  }

  const accessCheck = await canCreateWithdrawal(merchant.id, amount);
  if (!accessCheck.allowed) {
    if (accessCheck.reason === 'kyc_required') return { error: "Vous devez vérifier votre compte (KYC) pour effectuer des retraits réels." };
    if (accessCheck.reason === 'plan_required') return { error: "Vous devez avoir un plan actif pour retirer des fonds." };
    if (accessCheck.reason === 'withdrawal_limit_reached') return { error: "Votre limite de retrait journalière est atteinte." };
    return { error: "Access Denied" };
  }

  const isTest = merchant.current_environment === 'test';
  const activeBalance = isTest ? Number(merchant.available_balance_test || 0) : Number(merchant.available_balance || 0);

  if (amount > activeBalance) {
    return { error: "Solde insuffisant pour ce retrait." };
  }

  if (method === 'Zelle' && amount < 3125) {
    return { error: "Le montant minimum pour Zelle est de 3125 HTG (20 $)." };
  } else if (method !== 'Zelle' && amount < 150) {
    return { error: "Le montant minimum est de 150 HTG." };
  }

  if (method === 'MonCash' && !receiver) {
    return { error: "Numéro de réception requis pour MonCash." };
  }

  // 2FA Verification (Uniquement en mode Live)
  if (!isTest) {
    const { data: settings } = await supabase
      .from('settings')
      .select('security_json')
      .eq('merchant_id', merchant.id)
      .maybeSingle();
    
    const security = settings?.security_json || {};
    const twoFactorMethod = security.two_factor_method || 'none';

    if (code2fa) {
      // If they provided a code, verify it (either TOTP, or Email OTP)
      if (twoFactorMethod === 'totp') {
        const verified = speakeasy.totp.verify({
          secret: security.totp_secret,
          encoding: 'base32',
          token: code2fa,
          window: 1
        });
        if (!verified) {
          return { error: "Le code de l'application (TOTP) est invalide." };
        }
      } else {
        // Vérification OTP Email depuis la base de données (settings.security_json)
        const adminForOtp = createAdminClient();
        const { data: settingsForOtp } = await adminForOtp
          .from('settings')
          .select('security_json')
          .eq('merchant_id', merchant.id)
          .maybeSingle();

        const savedCode = settingsForOtp?.security_json?.email_otp_code;
        const expiresAt = settingsForOtp?.security_json?.email_otp_expires_at;

        if (!savedCode) {
          return { error: "Le code de vérification n'existe pas. Veuillez en demander un nouveau." };
        }
        if (expiresAt && new Date(expiresAt) < new Date()) {
          return { error: "Le code de vérification a expiré. Veuillez en demander un nouveau." };
        }
        if (savedCode !== code2fa) {
          return { error: "Le code de vérification email est incorrect." };
        }

        // Supprimer le code après utilisation
        const updatedSecurity = settingsForOtp?.security_json || {};
        delete updatedSecurity.email_otp_code;
        delete updatedSecurity.email_otp_expires_at;
        await adminForOtp.from('settings').update({ security_json: updatedSecurity }).eq('merchant_id', merchant.id);
      }
    } else if (twoFactorMethod !== 'none') {
      return { 
        error: "Une validation de sécurité (Code) est requise.",
        code: "validation_required",
        twoFactorMethod
      };
    }
  }

  const fees = method === 'Zelle' ? 0 : amount * 0.05; // Zelle: 0%, others: 5%
  const netAmount = amount - fees;

  const reference = `WTH-${Date.now()}`;
  let bazikResponse: any = null;
  
  // Appel API uniquement pour MonCash (NatCash = approbation manuelle)
  if (method === 'MonCash') {
    if (isTest) {
      bazikResponse = { transaction_id: `TEST-WTH-${Date.now()}` };
    } else {
      try {
        bazikResponse = await BazikService.createWithdrawal({
          amount: netAmount,
          receiver: receiver!,
          reference: reference,
          description: "Retrait Kobara",
        });
      } catch (error: any) {
        console.error("Bazik withdrawal error:", error);
        return { error: `Échec du transfert MonCash: ${error.message || "Erreur interne"}` };
      }
    }
  }

  const adminClient = createAdminClient();

  // NatCash : on ne déduit PAS le solde maintenant (admin doit approuver)
  const isNatcash = method === 'NatCash' || method === 'Natcash';
  
  if (!isNatcash) {
    // Déduction immédiate pour MonCash, Zelle
    const newBalance = activeBalance - amount;
    if (newBalance < 0) return { error: "Fonds insuffisants." };

    const updateData = isTest 
      ? { available_balance_test: newBalance }
      : { available_balance: newBalance };

    const { error: updateError } = await adminClient.from('merchants').update(updateData).eq('id', merchant.id);
    if (updateError) {
      console.error("Failed to update merchant balance:", updateError);
      return { error: "Erreur lors de la mise à jour du solde." };
    }
  }

  // Statut selon la méthode
  const bazikFinalStatus = bazikResponse?.status?.toLowerCase();
  const initialStatus = isNatcash 
    ? 'pending_approval'  // NatCash attend l'approbation admin
    : (bazikFinalStatus === 'success' || bazikFinalStatus === 'successful' || bazikFinalStatus === 'completed') 
      ? 'completed' 
      : (isTest ? 'completed' : (method === 'MonCash' ? 'pending' : 'completed'));

  const { error: insertError } = await adminClient
    .from('withdrawals')
    .insert({
      merchant_id: merchant.id,
      environment: merchant.current_environment || 'test',
      kobara_reference: reference,
      bazik_transaction_id: bazikResponse?.transaction_id || bazikResponse?.id || null,
      amount: netAmount,
      fees: fees,
      total: amount,
      wallet: receiver || merchant.phone,
      status: initialStatus,
      provider: method.toLowerCase()
    });

  if (insertError) {
    console.error("Failed to record withdrawal in DB", insertError);
    // Si NatCash, le solde n'a pas été déduit donc pas de rollback nécessaire
    return { error: "Erreur lors de l'enregistrement du retrait" };
  }

  // Notifications
  const { notifyWithdrawalCreated, notifyAdminWithdrawalCreated, notifyWithdrawalSuccess } = await import('@/lib/server/notifications');
  try {
    const { data: mData } = await adminClient.from('merchants').select('email').eq('id', merchant.id).single();
    if (mData) {
      if (initialStatus === 'completed') {
        await notifyWithdrawalSuccess(merchant.id, mData.email, amount);
      } else {
        await notifyWithdrawalCreated(merchant.id, mData.email, amount);
      }
    }
    // Notifier l'admin pour TOUS les retraits (MonCash, Zelle, NatCash, etc.)
    await notifyAdminWithdrawalCreated(merchant.id, netAmount, method, undefined, receiver || merchant.phone, amount);
  } catch(e) { console.error("Notification failed", e); }

  if (saveNumber && method === 'MonCash' && receiver) {
    const { data: currentSettings } = await supabase
      .from('settings')
      .select('settings_json')
      .eq('merchant_id', merchant.id)
      .maybeSingle();
      
    const generalSettings = currentSettings?.settings_json || {};
    generalSettings.saved_moncash_number = receiver;

    await adminClient
      .from('settings')
      .update({ settings_json: generalSettings })
      .eq('merchant_id', merchant.id);
  }

  revalidatePath('/dashboard/withdrawals');
  return { success: true, status: initialStatus };
}
