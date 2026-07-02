'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { BazikService } from "@/lib/server/bazik/bazik.service";
import { canCreateWithdrawal } from "@/lib/server/access";
import speakeasy from 'speakeasy';

export async function requestWithdrawal(amount: number, method: string, receiver?: string, code2fa?: string, _unused?: any, saveNumber?: boolean) {
  const { merchant, userRole, supabase } = await getCurrentUserAndMerchant();

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
        // Standard Email - verify from Redis where sendEmailOtpAction stored it
        const { safeRedis } = await import("@/lib/server/redis");
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData?.user?.email;
        
        if (!userEmail) {
          return { error: "Impossible de récupérer l'email de l'utilisateur." };
        }

        const otpKey = `otp:email:${userEmail}`;
        const savedCode = await safeRedis(async (r) => await r.get(otpKey), null);

        if (!savedCode) {
          return { error: "Le code de vérification a expiré ou n'existe pas. Veuillez en demander un nouveau." };
        }
        if (savedCode !== code2fa) {
          return { error: "Le code de vérification email est incorrect." };
        }
        // Consume the code from Redis
        await safeRedis(async (r) => await r.del(otpKey), null);
      }
    } else if (twoFactorMethod !== 'none') {
      return { 
        error: "Une validation de sécurité (Code) est requise.",
        code: "validation_required",
        twoFactorMethod
      };
    }
  }

  const fees = amount * 0.05; // 5% Kobara fee
  const netAmount = amount - fees;

  const reference = `WTH-${Date.now()}`;
  let bazikResponse: any = null;
  
  // 2. Appel de l'API (AVANT de déduire l'argent)
  if (method === 'MonCash') {
    if (isTest) {
      // Simulation pour l'environnement de test
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

  // 3. Déduction du solde de l'utilisateur (le total demandé)
  const newBalance = activeBalance - amount;

  if (newBalance < 0) {
    // Should never happen due to the check at the top, but just in case
    return { error: "Fonds insuffisants." };
  }

  const adminClient = createAdminClient();
  const updateData = isTest 
    ? { available_balance_test: newBalance }
    : { available_balance: newBalance };

  const { error: updateError } = await adminClient
    .from('merchants')
    .update(updateData)
    .eq('id', merchant.id);

  if (updateError) {
    console.error("Failed to update merchant balance:", updateError);
    return { error: "Erreur lors de la mise à jour du solde." };
  }

  // 4. Enregistrement en base de données
  const total = amount;
  const bazikFinalStatus = bazikResponse?.status?.toLowerCase();
  const initialStatus = (bazikFinalStatus === 'success' || bazikFinalStatus === 'successful' || bazikFinalStatus === 'completed') 
    ? 'completed' 
    : (isTest ? 'completed' : (method === 'MonCash' ? 'pending' : 'completed'));

  const { error: insertError } = await adminClient
    .from('withdrawals')
    .insert({
      merchant_id: merchant.id,
      environment: merchant.current_environment || 'test',
      kobara_reference: reference,
      bazik_transaction_id: bazikResponse?.transaction_id || bazikResponse?.id || null, // from bazik
      amount: netAmount,
      fees: fees,
      total: total,
      wallet: receiver || merchant.phone, // fallback to merchant phone
      status: initialStatus,
      provider: method.toLowerCase()
    });

  if (insertError) {
    console.error("Failed to record withdrawal in DB", insertError);
    return { error: "Erreur lors de l'enregistrement du retrait" };
  }

  // Create notifications
  const { notifyWithdrawalCreated, notifyAdminWithdrawalCreated, notifyWithdrawalSuccess } = await import('@/lib/server/notifications');
  try {
    const { data: mData } = await supabase.from('merchants').select('email').eq('id', merchant.id).single();
    if (mData) {
      if (initialStatus === 'completed') {
        // Send success immediately
        await notifyWithdrawalSuccess(merchant.id, mData.email, amount);
      } else {
        // Send pending request
        await notifyWithdrawalCreated(merchant.id, mData.email, amount);
      }
    }
    // If pending (Zelle, Natcash, or delayed Moncash), notify admin
    if (initialStatus === 'pending') {
      await notifyAdminWithdrawalCreated(merchant.id, amount, method);
    }
  } catch(e) { console.error("Notification failed", e); }

  if (saveNumber && method === 'MonCash' && receiver) {
    // Fetch current settings to avoid overriding other settings
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
