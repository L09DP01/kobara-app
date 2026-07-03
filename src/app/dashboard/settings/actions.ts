'use server'

import { auth } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getCurrentUserAndMerchant as getAuthUserAndMerchant } from "@/utils/supabase/auth-helper";
import { 
  notifyPasswordChange, 
  notify2faActivation, 
  notifyPlanActivation 
} from "@/lib/server/notifications";

export async function updatePayoutSettings(savedMoncashNumber: string) {
  const { merchant, supabase } = await getAuthUserAndMerchant();

  const { data: currentSettings } = await createAdminClient().from('settings')
    .select('settings_json')
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  const generalSettings = currentSettings?.settings_json || {};
  generalSettings.saved_moncash_number = savedMoncashNumber;

  const adminClient = createAdminClient();

  if (currentSettings) {
    const { error } = await adminClient
      .from('settings')
      .update({ settings_json: generalSettings })
      .eq('merchant_id', merchant.id);

    if (error) {
      throw new Error("Erreur lors de la mise à jour des paramètres de retrait");
    }
  } else {
    const { error } = await adminClient
      .from('settings')
      .insert({
        merchant_id: merchant.id,
        settings_json: generalSettings,
        security_json: { two_factor_method: 'none' },
        transaction_fee_percent: 2.9,
        settlement_method: 'manual'
      });

    if (error) {
      throw new Error("Erreur lors de la création des paramètres de retrait");
    }
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/withdrawals');
}

export async function updateMerchantProfile(formData: {
  business_name: string;
  category: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
}) {
  const { user, merchant, supabase } = await getAuthUserAndMerchant();

  // 1. Update merchants table
  const { error: merchantError } = await createAdminClient().from('merchants')
    .update({
      business_name: formData.business_name,
      category: formData.category,
      email: formData.email,
      phone: formData.phone,
      logo_url: formData.logo_url !== undefined ? formData.logo_url : merchant.logo_url,
      address: JSON.stringify({
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country || '',
        zipcode: formData.zipcode || ''
      })
    })
    .eq('id', merchant.id);

  if (merchantError) throw new Error("Erreur lors de la mise à jour du profil: " + merchantError.message);

  // 2. Update users table if names are provided
  if (formData.first_name !== undefined || formData.last_name !== undefined) {
    const { error: userError } = await createAdminClient().from('users')
      .update({
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (userError) throw new Error("Erreur lors de la mise à jour des informations personnelles: " + userError.message);
  }

  revalidatePath('/dashboard/settings');
}

export async function updateNotificationSettings(notificationsJson: any) {
  const { merchant, supabase } = await getAuthUserAndMerchant();

  const { error } = await createAdminClient().from('settings')
    .update({ notifications_json: notificationsJson })
    .eq('merchant_id', merchant.id);

  if (error) throw new Error("Failed to update notification settings");
  revalidatePath('/dashboard/settings');
}

export async function inviteTeamMember(email: string, role: string) {
  const { merchant, supabase } = await getAuthUserAndMerchant();

  // Only owners and admins can invite
  const { error } = await createAdminClient().from('merchant_members')
    .insert({
      merchant_id: merchant.id,
      email: email,
      role: role,
      status: 'pending'
    });

  if (error) throw new Error("Erreur lors de l'invitation: " + error.message);
  revalidatePath('/dashboard/settings');
}

export async function removeTeamMember(memberId: string) {
  const { merchant, supabase } = await getAuthUserAndMerchant();

  const { error } = await createAdminClient().from('merchant_members')
    .delete()
    .eq('id', memberId)
    .eq('merchant_id', merchant.id);

  if (error) throw new Error("Erreur lors de la suppression");
  revalidatePath('/dashboard/settings');
}

export async function updatePassword(password: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) {
    throw new Error("Non autorisé");
  }

  if (password.length < 6) {
    throw new Error("Le mot de passe doit comporter au moins 6 caractères.");
  }

  const supabase = createAdminClient();
  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await createAdminClient().from('users')
    .update({ password_hash: passwordHash })
    .eq('id', user.id);

  if (error) {
    throw new Error("Erreur lors de la mise à jour du mot de passe: " + error.message);
  }

  try {
    const { data: mData } = await createAdminClient().from('merchants').select('id').eq('user_id', user.id).single();
    if (mData) {
      await notifyPasswordChange(mData.id, user.email);
    }
  } catch (e) { console.error("Notification failed", e); }

  return { success: true };
}

// -------------------------------------------------------------
// 2FA / MFA DUAL-METHOD SERVER ACTIONS (EMAIL & AUTHENTICATOR)
// -------------------------------------------------------------

async function getOrCreateSettings(supabase: any, merchantId: string) {
  const { data, error } = await createAdminClient().from('settings')
    .select('*')
    .eq('merchant_id', merchantId)
    .maybeSingle();

  if (data) return data;

  // Insert default row
  const { data: inserted, error: insertError } = await createAdminClient().from('settings')
    .insert({
      merchant_id: merchantId,
      transaction_fee_percent: 2.9,
      settlement_method: 'manual',
      security_json: { two_factor_method: 'none' }
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create settings row:", insertError);
    throw new Error("Impossible d'initialiser les paramètres de sécurité");
  }

  return inserted;
}

export async function sendEmailOtpAction() {
  const { user, merchant } = await getAuthUserAndMerchant();
  const adminClient = createAdminClient();

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Get existing settings
  const { data: currentSettings } = await adminClient
    .from('settings')
    .select('security_json')
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  const securityJson = currentSettings?.security_json || {};
  securityJson.email_otp_code = code;
  securityJson.email_otp_expires_at = expiresAt;

  // Save to DB
  if (currentSettings) {
    await adminClient.from('settings').update({ security_json: securityJson }).eq('merchant_id', merchant.id);
  } else {
    await adminClient.from('settings').insert({
      merchant_id: merchant.id,
      security_json: securityJson,
      transaction_fee_percent: 2.9,
      settlement_method: 'manual'
    });
  }

  // Send email
  const { sendEmail } = await import("@/lib/server/mail");
  await sendEmail({
    to: user.email!,
    subject: "Votre code de vérification Kobara",
    text: `Bonjour,\n\nVotre code de vérification temporaire à 6 chiffres pour votre compte Kobara est : ${code}\n\nCe code est valide pendant 10 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.\n\nCordialement,\nL'équipe Kobara`
  });

  return { success: true };
}

export async function verifyEmailOtpAction(code: string) {
  const { user, merchant, supabase } = await getAuthUserAndMerchant();
  const cookieStore = await cookies();

  const { safeRedis } = await import("@/lib/server/redis");
  const otpKey = `otp:email:${user.email}`;
  
  const savedCode = await safeRedis(async (r) => await r.get(otpKey), null);

  if (!savedCode) {
    throw new Error("Le code a expiré ou n'existe pas. Veuillez en demander un nouveau.");
  }

  if (savedCode !== code) {
    throw new Error("Le code saisi est incorrect.");
  }

  // Delete the OTP after successful verification
  await safeRedis(async (r) => await r.del(otpKey), null);

  // Update settings in DB
  const settings = await getOrCreateSettings(supabase, merchant.id);
  const security = settings.security_json || {};

  // Set method as email in security_json
  const updatedSecurity = {
    ...security,
    two_factor_method: 'email',
    email_otp: null
  };

  const { error } = await createAdminClient().from('settings')
    .update({ security_json: updatedSecurity })
    .eq('merchant_id', merchant.id);

  if (error) {
    throw new Error("Erreur lors de l'activation de la double authentification");
  }

  try {
    const { user } = await getAuthUserAndMerchant();
    await notify2faActivation(merchant.id, user.email, 'Email');
  } catch (e) { console.error("Notification failed", e); }

  // Set secure, HTTP-only cookie indicating verification passed
  cookieStore.set({
    name: 'kbr_2fa_email_ok',
    value: 'true',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  });

  revalidatePath('/dashboard/settings');
  return { success: true };
}

import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function generateTotpSecretAction() {
  const { user, merchant, supabase } = await getAuthUserAndMerchant();
  
  const secret = speakeasy.generateSecret({
    name: `Kobara (${user.email})`
  });

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

  const settings = await getOrCreateSettings(supabase, merchant.id);
  const security = settings.security_json || {};

  const updatedSecurity = {
    ...security,
    pending_totp_secret: secret.base32
  };

  const { error } = await createAdminClient().from('settings')
    .update({ security_json: updatedSecurity })
    .eq('merchant_id', merchant.id);

  if (error) throw new Error("Erreur lors de la génération du secret TOTP");

  return { secret: secret.base32, qrCodeDataUrl };
}

export async function verifyAndActivateTotpAction(token: string) {
  const { merchant, supabase } = await getAuthUserAndMerchant();
  const settings = await getOrCreateSettings(supabase, merchant.id);
  const security = settings.security_json || {};

  const pendingSecret = security.pending_totp_secret;
  if (!pendingSecret) {
    throw new Error("Aucune configuration TOTP en attente.");
  }

  const verified = speakeasy.totp.verify({
    secret: pendingSecret,
    encoding: 'base32',
    token: token,
    window: 1
  });

  if (!verified) {
    throw new Error("Le code de vérification est invalide ou expiré.");
  }

  const updatedSecurity = {
    ...security,
    two_factor_method: 'totp',
    totp_secret: pendingSecret,
    email_otp: null,
    pending_totp_secret: null
  };

  const { error } = await createAdminClient().from('settings')
    .update({ security_json: updatedSecurity })
    .eq('merchant_id', merchant.id);

  if (error) throw new Error("Erreur de sauvegarde de la configuration");

  try {
    const { user } = await getAuthUserAndMerchant();
    await notify2faActivation(merchant.id, user.email, 'Application Authenticator');
  } catch (e) { console.error("Notification failed", e); }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
export async function deletePasskeyAction(passkeyId: string) {
  const { merchant, supabase } = await getAuthUserAndMerchant();

  const { data: settings } = await createAdminClient().from('settings')
    .select('security_json')
    .eq('merchant_id', merchant.id)
    .single();

  const security = settings?.security_json || {};
  const passkeys = security.passkeys || [];

  const updatedPasskeys = passkeys.filter((pk: any) => pk.id !== passkeyId);

  const { error } = await createAdminClient().from('settings')
    .update({ security_json: { ...security, passkeys: updatedPasskeys } })
    .eq('merchant_id', merchant.id);

  if (error) throw new Error("Erreur lors de la suppression de la clé biométrique");

  revalidatePath('/dashboard/settings');
  return { success: true };
}
export async function disable2faAction() {
  const { merchant, supabase } = await getAuthUserAndMerchant();
  const cookieStore = await cookies();

  const settings = await getOrCreateSettings(supabase, merchant.id);
  const security = settings.security_json || {};

  const updatedSecurity = {
    ...security,
    two_factor_method: 'none',
    email_otp: null
  };

  const { error } = await createAdminClient().from('settings')
    .update({ security_json: updatedSecurity })
    .eq('merchant_id', merchant.id);

  if (error) throw new Error("Impossible de désactiver le 2FA");

  // Delete email verified cookie
  cookieStore.delete('kbr_2fa_email_ok');

  revalidatePath('/dashboard/settings');
  return { success: true };
}
