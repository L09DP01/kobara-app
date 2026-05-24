import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user) {
    redirect('/login');
  }

  const supabase = createAdminClient();

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('id', user.id)
    .single();

  console.log("SettingsPage - dbUser fetched:", dbUser);

  if (!dbUser) {
    redirect('/login');
  }

  // Get current merchant id (works for owners and active team members)
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  let merchantId = merchant?.id;

  if (!merchantId) {
    const { data: member } = await supabase
      .from('merchant_members')
      .select('merchant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (member) {
      merchantId = member.merchant_id;
    }
  }

  if (!merchantId) {
    redirect('/onboarding');
  }

  const { data: activeMerchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', merchantId)
    .single();

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('merchant_id', merchantId)
    .maybeSingle();

  const { data: members } = await supabase
    .from('merchant_members')
    .select('*')
    .eq('merchant_id', merchantId);

  return (
    <SettingsClient 
      user={dbUser} 
      merchant={activeMerchant} 
      settings={settings} 
      members={members || []} 
    />
  );
}
