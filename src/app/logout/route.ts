import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  
  const domain = process.env.NODE_ENV === 'production' ? '.kobara.app' : 'localhost';

  // Force expire all NextAuth cookies on the root domain and subdomains
  const cookiesToDelete = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Secure-next-auth.callback-url',
    '__Secure-next-auth.csrf-token',
    'kbr_2fa_email_ok',
    'kbr_2fa_totp_ok'
  ];

  for (const name of cookiesToDelete) {
    // Delete for exact current domain (fallback)
    cookieStore.delete(name);
    // Delete for root domain to catch cross-subdomain cookies
    cookieStore.set(name, '', { domain, maxAge: 0, path: '/' });
  }
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kobara.app';
  
  // Redirect back to login with a clean state
  return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Votre session a expiré ou est invalide. Veuillez vous reconnecter.")}`);
}
