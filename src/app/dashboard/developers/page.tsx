import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DevelopersClient } from "./developers-client";

export default async function DevelopersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: merchantId } = await supabase.rpc('get_current_merchant_id');

  if (!merchantId) {
    redirect('/login');
  }

  // Get merchant info
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, status')
    .eq('id', merchantId)
    .single();

  // Get API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('prefix, environment')
    .eq('merchant_id', merchantId)
    .in('name', ['Default Live Key', 'Default Test Key'])
    .order('created_at', { ascending: false });

  let testPublicKey = 'kobara_pk_test_...';
  let livePublicKey = 'kobara_pk_live_...';

  if (apiKeys) {
    const testKey = apiKeys.find(k => k.environment === 'test');
    const liveKey = apiKeys.find(k => k.environment === 'live');
    if (testKey) testPublicKey = testKey.prefix + '...';
    if (liveKey) livePublicKey = liveKey.prefix + '...';
  }

  // Get webhook status
  const { data: webhooks } = await supabase
    .from('webhook_endpoints')
    .select('url, status')
    .eq('merchant_id', merchantId)
    .eq('status', 'active')
    .limit(1);

  const webhook = webhooks && webhooks.length > 0 
    ? { configured: true, url: webhooks[0].url } 
    : { configured: false, url: null };

  // Calculate usage (mock values as per specs, can be wired later)
  const usage = {
    apiCallsToday: 124,
    paymentsThisMonth: 8,
    planLimit: 10
  };

  const subscription = {
    plan: "Free",
    status: merchant?.status || "active"
  };

  return (
    <DevelopersClient 
      merchant={merchant} 
      testPublicKey={testPublicKey} 
      livePublicKey={livePublicKey}
      webhook={webhook}
      usage={usage}
      subscription={subscription}
    />
  );
}
