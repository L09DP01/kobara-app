import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { ApiKeysClient } from "./api-keys-client";

export default async function ApiKeysPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <ApiKeysClient initialKeys={apiKeys || []} />;
}
