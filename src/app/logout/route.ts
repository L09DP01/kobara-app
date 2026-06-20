import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  
  // Clear all authentication cookies that might cause loops
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('next-auth.csrf-token');
  cookieStore.delete('next-auth.callback-url');
  cookieStore.delete('__Secure-next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.callback-url');
  cookieStore.delete('__Secure-next-auth.csrf-token');
  cookieStore.delete('kbr_2fa_email_ok');
  cookieStore.delete('kbr_2fa_totp_ok');
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kobara.app';
  
  // Redirect back to login with a clean state
  return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Votre session a expiré ou est invalide. Veuillez vous reconnecter.")}`);
}
