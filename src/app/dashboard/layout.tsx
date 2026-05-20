import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Pages inside /dashboard that are publicly accessible (no login required)
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/developers"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await getServerSession(authOptions);

  // Determine the current path to check if it's a public dashboard page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPublicDashboardPath = PUBLIC_DASHBOARD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  let merchant = null;
  let dbUser = null;
  const user = session?.user as any;

  if (user) {
    const supabase = createAdminClient();
    const { data: merchantData } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (merchantData) {
      merchant = merchantData;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (userData) {
      dbUser = userData;
    }
  }

  // For protected pages: redirect non-authenticated or non-merchants
  if (!user && !isPublicDashboardPath) {
    redirect("/login");
  }

  if (user && (!merchant || !merchant.phone || !merchant.category) && !isPublicDashboardPath) {
    redirect("/onboarding");
  }

  // -------------------------------------------------------------
  // DUAL-METHOD 2FA SECURITY ENFORCEMENT INTERCEPTION
  // -------------------------------------------------------------
  if (merchant && !isPublicDashboardPath) {
    const supabase = createAdminClient();
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("merchant_id", merchant.id)
      .maybeSingle();

    const twoFactorMethod = settings?.security_json?.two_factor_method || 'none';

    if (twoFactorMethod === 'totp') {
      const hasTotp2faCookie = cookieStore.get('kbr_2fa_totp_ok')?.value === 'true';
      if (!hasTotp2faCookie) {
        redirect('/login/challenge-totp');
      }
    } else if (twoFactorMethod === 'email') {
      const hasEmail2faCookie = cookieStore.get('kbr_2fa_email_ok')?.value === 'true';
      if (!hasEmail2faCookie) {
        redirect('/login/challenge-email');
      }
    }
  }

  // For public dashboard pages: render without sidebar if no merchant
  return (
    <DashboardLayoutClient merchant={merchant ?? undefined} user={dbUser} isGuest={!merchant}>
      {children}
    </DashboardLayoutClient>
  );
}
