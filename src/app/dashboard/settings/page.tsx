import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get current merchant id (works for owners and active team members)
  const { data: merchantId } = await supabase.rpc('get_current_merchant_id');

  if (!merchantId) {
    // If no merchant profile at all, redirect or show error
    redirect('/onboarding'); // or somewhere else
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', merchantId)
    .single();

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('merchant_id', merchantId)
    .single();

  const { data: members } = await supabase
    .from('merchant_members')
    .select('*')
    .eq('merchant_id', merchantId);

  return <SettingsClient user={user} merchant={merchant} settings={settings} members={members || []} />;
}
