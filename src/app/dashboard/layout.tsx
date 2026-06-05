import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { EnvironmentProvider } from "@/context/EnvironmentContext";

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
  let notifications = [];
  const user = session?.user as any;

  let accessibleMerchants: any[] = [];
  let userRole = 'owner';

  if (user) {
    const supabase = createAdminClient();
    const activeMerchantId = cookieStore.get('kobara_active_merchant')?.value;
    
    // Fetch all owned merchants
    const { data: owned } = await supabase.from('merchants').select('*').eq('user_id', user.id);
    if (owned) accessibleMerchants.push(...owned.map((m: any) => ({ ...m, role: 'owner' })));
    
    // Fetch all member merchants
    const { data: memberships } = await supabase.from('merchant_members').select('role, merchants(*)').eq('user_id', user.id).eq('status', 'active');
    if (memberships) {
       accessibleMerchants.push(...memberships.map((m: any) => ({ ...m.merchants, role: m.role || 'developer' })));
    }

    // Determine current merchant
    if (activeMerchantId) {
      const selected = accessibleMerchants.find((m: any) => m.id === activeMerchantId);
      if (selected) {
         merchant = selected;
         userRole = selected.role;
      }
    }
    
    if (!merchant && accessibleMerchants.length > 0) {
      merchant = accessibleMerchants[0];
      userRole = accessibleMerchants[0].role;
    }

    if (merchant) {
      
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('merchant_id', merchant.id)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10);
      notifications = notifs || [];
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
    <EnvironmentProvider>
      <DashboardLayoutClient merchant={merchant ?? undefined} user={dbUser} isGuest={!merchant} initialNotifications={notifications} accessibleMerchants={accessibleMerchants} userRole={userRole}>
        {children}
      </DashboardLayoutClient>
    </EnvironmentProvider>
  );
}
