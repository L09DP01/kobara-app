import { SignJWT, jwtVerify } from 'jose';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail } from '@/lib/server/mail';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_kobara_admin_2026'
);

// 5 minutes in milliseconds
export const ADMIN_SESSION_TIMEOUT_MS = 5 * 60 * 1000;

export async function generateAdminOtp(email: string) {
  const supabase = createAdminClient();
  
  // Verify if email is a super admin
  const { data: admin } = await supabase
    .from('super_admins')
    .select('id')
    .ilike('email', email)
    .single();

  if (!admin) {
    // Return success to avoid email enumeration, but don't do anything
    return { success: true };
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Expires in 5 minutes
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  // Invalidate previous OTPs
  await supabase
    .from('admin_otps')
    .update({ used: true })
    .eq('email', email)
    .eq('used', false);

  // Save new OTP
  await supabase
    .from('admin_otps')
    .insert({
      email,
      code,
      expires_at: expiresAt.toISOString(),
      used: false
    });

  // Send email (this uses nodemailer with real SMTP if configured)
  await sendEmail({
    to: email,
    subject: "Code de vérification Super Admin",
    text: `Bonjour Administrateur,

Une connexion au panneau Super Admin a été demandée.
Ce code est valide pendant 5 minutes. Ne le partagez avec personne.

Votre code de vérification temporaire à 6 chiffres pour votre compte Kobara est : ${code}`
  });

  return { success: true };
}

export async function verifyAdminOtp(email: string, code: string) {
  const supabase = createAdminClient();
  
  const { data: otp } = await supabase
    .from('admin_otps')
    .select('*')
    .ilike('email', email)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!otp) {
    return { success: false, error: 'Code invalide ou expiré' };
  }

  // Mark as used
  await supabase
    .from('admin_otps')
    .update({ used: true })
    .eq('id', otp.id);

  // Verify it's still a super admin
  const { data: admin } = await supabase
    .from('super_admins')
    .select('id')
    .ilike('email', email)
    .single();

  if (!admin) {
    return { success: false, error: 'Accès refusé' };
  }

  // Generate JWT
  const token = await new SignJWT({ email, role: 'superadmin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET);

  return { success: true, token };
}

export async function verifyAdminJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'superadmin') return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export async function refreshAdminJwt(token: string) {
  const payload = await verifyAdminJwt(token);
  if (!payload) return null;

  // Generate new token with new 5m expiration
  const newToken = await new SignJWT({ email: payload.email, role: 'superadmin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET);

  return newToken;
}
