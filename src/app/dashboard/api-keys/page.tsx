import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiKeysClient } from "./api-keys-client";

export default async function ApiKeysPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    redirect('/login');
  }

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <ApiKeysClient initialKeys={apiKeys || []} />;
}
