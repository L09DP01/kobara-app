import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  let merchant = null;

  if (user) {
    const { data } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      merchant = data;
    }
  }

  if (!merchant) {
    redirect('/onboarding');
  }

  return (
    <DashboardLayoutClient merchant={merchant}>
      {children}
    </DashboardLayoutClient>
  );
}
