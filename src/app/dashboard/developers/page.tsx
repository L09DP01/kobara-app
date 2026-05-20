import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createAdminClient } from "@/utils/supabase/admin";
import { DevelopersClient } from "./developers-client";

export default async function DevelopersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // ── Guest (not logged in) ── show generic sandbox data, no real keys
  if (!user) {
    return (
      <DevelopersClient
        merchant={null}
        testPublicKey="kobara_pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
        livePublicKey="kobara_pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
        webhook={{ configured: false, url: null }}
        usage={{ apiCallsToday: 0, paymentsThisMonth: 0, planLimit: 10 }}
        subscription={{ plan: "Free", status: "active" }}
        isGuest={true}
      />
    );
  }

  // ── Authenticated user ── fetch real data using admin client
  const supabase = createAdminClient();

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!merchant) {
    // Logged in but no merchant record yet → show sandbox data
    return (
      <DevelopersClient
        merchant={null}
        testPublicKey="kobara_pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
        livePublicKey="kobara_pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
        webhook={{ configured: false, url: null }}
        usage={{ apiCallsToday: 0, paymentsThisMonth: 0, planLimit: 10 }}
        subscription={{ plan: "Free", status: "active" }}
        isGuest={true}
      />
    );
  }

  const merchantId = merchant.id;

  // Get API keys (prefix only — full key never stored in plain text)
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('prefix, environment')
    .eq('merchant_id', merchantId)
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

  const usage = {
    apiCallsToday: 124,
    paymentsThisMonth: 8,
    planLimit: 10
  };

  const subscription = {
    plan: "Free",
    status: merchant.status || "active"
  };

  return (
    <DevelopersClient
      merchant={merchant}
      testPublicKey={testPublicKey}
      livePublicKey={livePublicKey}
      webhook={webhook}
      usage={usage}
      subscription={subscription}
      isGuest={false}
    />
  );
}
