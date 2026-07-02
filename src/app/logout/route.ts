import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  
  const hostname = request.headers.get("host")?.split(":")[0] || "kobara.app";
  const domain = (hostname.includes('localhost') || hostname.includes('local')) ? 'localhost' : '.kobara.app';

  // Force expire all NextAuth cookies on the root domain and subdomains
  const cookiesToDelete = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Secure-next-auth.callback-url',
    '__Secure-next-auth.csrf-token',
    'kbr_2fa_email_ok',
    'kbr_2fa_totp_ok',
    'kobara_last_activity',
  ];

  const appUrl = (hostname.includes('localhost') || hostname.includes('local'))
    ? `http://${hostname.replace('dashboard.', '').split(':')[0]}:3000`
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://kobara.app');
  
  const response = NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Votre session a expiré ou est invalide. Veuillez vous reconnecter.")}`);

  for (const name of cookiesToDelete) {
    // Delete for exact current domain (fallback)
    cookieStore.delete(name);
    // Delete for root domain to catch cross-subdomain cookies
    response.cookies.set(name, '', { domain, maxAge: 0, path: '/', httpOnly: true });
    // Also try without domain for same-origin cookies
    response.cookies.set(name, '', { maxAge: 0, path: '/', httpOnly: true });
  }
  
  return response;
}
