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
    .select('id, business_name, status, plan_slug')
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
        subscription={{ plan: "Sandbox (Gratuit)", status: "active" }}
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  // Get API calls today (using audit_logs as proxy)
  const { count: apiCallsToday } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .gte('created_at', startOfDay);

  // Get payments this month
  const { count: paymentsThisMonth } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .gte('created_at', startOfMonth);

  const usage = {
    apiCallsToday: apiCallsToday || 0,
    paymentsThisMonth: paymentsThisMonth || 0,
    planLimit: merchant.plan_slug === 'test_only' ? 10 : 1000
  };

  let planName = "Sandbox (Gratuit)";
  if (merchant.plan_slug === 'starter') planName = "Starter";
  if (merchant.plan_slug === 'pro') planName = "Pro";
  if (merchant.plan_slug === 'business') planName = "Business";

  const subscription = {
    plan: planName,
    status: merchant.status === 'active' ? 'Actif' : 'En attente'
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
