import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/server/mail';

export async function GET() {
  const emails = [
    "kerlensdelmazin144@gmail.com",
    "bazelaisfanfan10@gmail.com",
    "contact@lakay-company.com"
  ];
  
  const supabase = createAdminClient();
  const results = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kobara.app';

  for (const email of emails) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email_verified')
        .eq('email', email)
        .maybeSingle();

      if (error || !user) {
        results.push({ email, status: 'error', reason: 'Not found' });
        continue;
      }

      if (user.email_verified) {
        results.push({ email, status: 'skipped', reason: 'Already verified' });
        continue;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_token: token,
          verification_token_expires: tokenExpires
        })
        .eq('id', user.id);

      if (updateError) {
        results.push({ email, status: 'error', reason: 'DB update failed' });
        continue;
      }

      const verificationLink = `${appUrl}/api/auth/verify-email?token=${token}`;

      await sendWelcomeEmail({
        to: email,
        verificationLink
      });

      results.push({ email, status: 'success' });
    } catch (e: any) {
      results.push({ email, status: 'error', reason: e.message });
    }
  }

  return NextResponse.json({ success: true, results });
}
