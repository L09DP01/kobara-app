import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get user by email
    const { data: user } = await supabase.from('users').select('id, email').eq('email', email.toLowerCase().trim()).maybeSingle();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Get merchant to find settings
    const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // 3. Get passkeys from settings
    const { data: settings } = await supabase.from('settings').select('security_json').eq('merchant_id', merchant.id).maybeSingle();
    const security = settings?.security_json || {};
    const passkeys = security.passkeys || [];

    if (passkeys.length === 0) {
      return NextResponse.json({ error: 'No passkeys registered for this user' }, { status: 400 });
    }

    const host = req.headers.get('host');
    const rpID = host ? host.split(':')[0] : (process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'localhost');

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: passkeys.map((pk: any) => ({
        id: pk.id,
        type: 'public-key',
        // Omit transports to force the browser to show QR code / cross-platform options
        // transports: pk.transports,
      })),
      userVerification: 'preferred',
    });

    // Store challenge to verify later
    await supabase.from('settings').update({
      security_json: { ...security, auth_challenge: options.challenge }
    }).eq('merchant_id', merchant.id);

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('generate-auth-options error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
