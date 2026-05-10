import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WebhooksClient } from "./webhooks-client";

export default async function WebhooksPage() {
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

  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <WebhooksClient endpoints={endpoints || []} />;
}
