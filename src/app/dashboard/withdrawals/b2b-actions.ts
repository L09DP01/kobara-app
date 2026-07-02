'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import speakeasy from 'speakeasy';

export async function executeB2BTransfer(amount: number, receiverEmail: string, code2fa?: string) {
  const { merchant, userRole, supabase } = await getCurrentUserAndMerchant();

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
  const { notifyB2BTransferSent, notifyB2BTransferReceived } = await import('@/lib/server/notifications');
  try {
    // Notify Sender
    const { data: senderData } = await supabase.from('merchants').select('email, business_name').eq('id', merchant.id).single();
    if (senderData) {
      await notifyB2BTransferSent(merchant.id, senderData.email, amount, receiverEmail);
    }
    
    // Notify Receiver
    const { data: receiverData } = await adminClient.from('merchants').select('email').eq('id', rpcResult.receiver_id).single();
    if (receiverData) {
      await notifyB2BTransferReceived(rpcResult.receiver_id, receiverData.email, amount, senderData?.business_name || 'Un marchand');
    }
  } catch(e) { 
    console.error("Notifications for B2B failed", e); 
  }

  revalidatePath('/dashboard/withdrawals');
  return { success: true };
}
