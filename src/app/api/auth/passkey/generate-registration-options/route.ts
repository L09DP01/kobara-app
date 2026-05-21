import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getCurrentUserAndMerchant } from '@/utils/supabase/auth-helper';

export async function GET() {
  try {
    const { user, merchant, supabase } = await getCurrentUserAndMerchant();

    const rpID = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'localhost';
    
    // Fallback simple string to Uint8Array if helper not found
    const userID = new Uint8Array(Buffer.from(user.id));

    const options = await generateRegistrationOptions({
      rpName: 'Kobara',
      rpID,
      userID,
      userName: user.email!,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    // Store the challenge in settings to verify later
    const { data: settings } = await supabase.from('settings').select('security_json').eq('merchant_id', merchant.id).single();
    const security = settings?.security_json || {};
    
    await supabase.from('settings').update({
      security_json: { ...security, current_challenge: options.challenge }
    }).eq('merchant_id', merchant.id);

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('generate-registration-options error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
