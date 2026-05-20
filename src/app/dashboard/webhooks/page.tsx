import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { WebhooksClient } from "./webhooks-client";

export default async function WebhooksPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <WebhooksClient endpoints={endpoints || []} />;
}
