'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import speakeasy from 'speakeasy';

export async function executeB2BTransfer(amount: number, receiverEmail: string, code2fa?: string) {
  const { user, merchant, userRole, supabase } = await getCurrentUserAndMerchant();

  if (!merchant) {
    return { error: "Merchant not found" };
  }

  if (userRole !== 'owner') {
    return { error: "Accès refusé. Seul le propriétaire peut effectuer des transferts B2B." };
  }

  const isTest = merchant.current_environment === 'test';
  const activeBalance = isTest ? Number(merchant.available_balance_test || 0) : Number(merchant.available_balance || 0);

  if (amount > activeBalance) {
    return { error: "Solde insuffisant pour ce transfert." };
  }

  if (amount < 1) {
    return { error: "Le montant minimum est de 1 HTG." };
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
        const { createAdminClient: createAdmin } = await import("@/utils/supabase/admin");
        const adminForOtp = createAdmin();
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

  const adminClient = createAdminClient();

  // Executing the secure RPC function
  const { data: rpcResult, error: rpcError } = await adminClient.rpc('process_b2b_transfer', {
    p_sender_id: merchant.id,
    p_receiver_email: receiverEmail,
    p_amount: amount,
    p_environment: merchant.current_environment || 'test'
  });

  if (rpcError) {
    console.error("B2B Transfer RPC Error:", rpcError);
    return { error: "Erreur lors de l'exécution du transfert. Veuillez réessayer." };
  }

  if (!rpcResult.success) {
    return { error: rpcResult.error || "Le transfert a échoué." };
  }

  // Notifications
  const { notifyB2BTransferSent, notifyB2BTransferReceived, notifyAdminWithdrawalCreated } = await import('@/lib/server/notifications');
  try {
    const { data: senderData } = await adminClient.from('merchants').select('email, business_name').eq('id', merchant.id).single();
    if (senderData) {
      await notifyB2BTransferSent(merchant.id, senderData.email, amount, receiverEmail);
    }
    
    const { data: receiverData } = await adminClient.from('merchants').select('email').eq('id', rpcResult.receiver_id).single();
    if (receiverData) {
      await notifyB2BTransferReceived(rpcResult.receiver_id, receiverData.email, amount, senderData?.business_name || 'Un marchand');
    }

    // Notifier l'admin pour tous les transferts B2B
    await notifyAdminWithdrawalCreated(merchant.id, amount, 'B2B Transfer', undefined, receiverEmail, amount);
  } catch(e) { 
    console.error("Notifications for B2B failed", e); 
  }

  revalidatePath('/dashboard/withdrawals');
  return { success: true };
}
