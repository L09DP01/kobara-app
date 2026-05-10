import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
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

  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      payments (
        id,
        gross_amount,
        created_at
      )
    `)
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <CustomersClient customers={customers || []} />;
}
