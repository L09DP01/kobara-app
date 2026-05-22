'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { BazikService } from "@/lib/server/bazik/bazik.service";
import { canCreateWithdrawal } from "@/lib/server/access";
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import speakeasy from 'speakeasy';

export async function requestWithdrawal(amount: number, method: string, receiver?: string, code2fa?: string, passkeyResponse?: string) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  const accessCheck = await canCreateWithdrawal(merchant.id, amount);
  if (!accessCheck.allowed) {
    if (accessCheck.reason === 'kyc_required') throw new Error("Vous devez vérifier votre compte (KYC) pour effectuer des retraits réels.");
    if (accessCheck.reason === 'plan_required') throw new Error("Vous devez avoir un plan actif pour retirer des fonds.");
    if (accessCheck.reason === 'withdrawal_limit_reached') throw new Error("Votre limite de retrait journalière est atteinte.");
    throw new Error("Access Denied");
  }

  if (amount > Number(merchant.available_balance)) {
    throw new Error("Solde insuffisant pour ce retrait.");
  }

  if (amount < 100) {
    throw new Error("Le montant minimum est de 100 HTG.");
  }

  if (method === 'MonCash' && !receiver) {
    throw new Error("Numéro de réception requis pour MonCash.");
  }

  // 2FA Verification
  const { data: settings } = await supabase
    .from('settings')
    .select('security_json')
    .eq('merchant_id', merchant.id)
    .maybeSingle();
  
  const security = settings?.security_json || {};
  const twoFactorMethod = security.two_factor_method || 'none';

  if (passkeyResponse) {
    const responseBody = JSON.parse(passkeyResponse);
    const passkeys = security.passkeys || [];
    const expectedChallenge = security.auth_challenge;

    if (!expectedChallenge) throw new Error("Challenge invalide ou expiré.");

    const passkey = passkeys.find((pk: any) => pk.id === responseBody.id);
    if (!passkey) throw new Error("Clé biométrique introuvable.");

    const rpID = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'localhost';
    const origin = process.env.NEXT_PUBLIC_APP_URL || `http://${rpID}:3000`;

    const verification = await verifyAuthenticationResponse({
      response: responseBody,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.id, 'base64url'),
        credentialPublicKey: Buffer.from(passkey.publicKey, 'base64url'),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verification.verified) {
      throw new Error("Authentification biométrique échouée.");
    }

    // Update counter and clear challenge
    passkey.counter = verification.authenticationInfo.newCounter;
    await supabase.from('settings').update({ 
      security_json: { ...security, passkeys, auth_challenge: null }
    }).eq('merchant_id', merchant.id);
  } else if (code2fa) {
    // If they provided a code, verify it (either TOTP, or Email OTP as fallback/primary)
    if (twoFactorMethod === 'totp') {
      const verified = speakeasy.totp.verify({
        secret: security.totp_secret,
        encoding: 'base32',
        token: code2fa,
        window: 1
      });
      if (!verified) {
        throw new Error("Le code de l'application (TOTP) est invalide.");
      }
    } else {
      // Standard Email or Fallback Email (if Passkey failed)
      const emailOtp = security.email_otp || {};
      if (!emailOtp.code || emailOtp.code !== code2fa) {
        throw new Error("Le code de vérification email est incorrect.");
      }
      const expiresAt = new Date(emailOtp.expires_at).getTime();
      if (Date.now() > expiresAt) {
        throw new Error("Le code de vérification email a expiré.");
      }
      // Consume the code
      await supabase.from('settings').update({
        security_json: { ...security, email_otp: null }
      }).eq('merchant_id', merchant.id);
    }
  } else if ((security.passkeys && security.passkeys.length > 0) || twoFactorMethod !== 'none') {
    throw new Error("Une validation de sécurité (Biométrie ou Code) est requise.");
  }

  const reference = `WTH-${Date.now()}`;
  let bazikResponse: any = null;
  
  // 2. Appel de l'API Bazik (AVANT de déduire l'argent)
  if (method === 'MonCash') {
    try {
      bazikResponse = await BazikService.createWithdrawal({
        amount: amount,
        receiver: receiver!,
        reference: reference,
        description: "Retrait Kobara",
      });
    } catch (error: any) {
      console.error("Bazik withdrawal error:", error);
      throw new Error(`Échec du transfert MonCash: ${error.message || "Erreur interne"}`);
    }
  }

  // 3. Déduction du solde de l'utilisateur
  const newBalance = Number(merchant.available_balance) - amount;

  const { error: updateError } = await supabase
    .from('merchants')
    .update({ available_balance: newBalance })
    .eq('id', merchant.id);

  if (updateError) {
    throw new Error("Erreur critique: le transfert est passé mais le solde n'a pu être mis à jour. Veuillez contacter le support.");
  }

  const adminClient = createAdminClient();

  // 4. Enregistrement en base de données
  const fees = 0; // Calculer si nécessaire
  const total = amount;
  const { error: insertError } = await adminClient
    .from('withdrawals')
    .insert({
      merchant_id: merchant.id,
      kobara_reference: reference,
      bazik_transaction_id: bazikResponse?.id || null, // from bazik
      amount: amount,
      fees: fees,
      total: total,
      wallet: receiver || merchant.phone, // fallback to merchant phone
      status: method === 'MonCash' ? 'pending' : 'completed',
      provider: method.toLowerCase()
    });

  if (insertError) {
    console.error("Failed to record withdrawal in DB", insertError);
    throw new Error("Erreur lors de l'enregistrement du retrait");
  }

  revalidatePath('/dashboard/withdrawals');
}
