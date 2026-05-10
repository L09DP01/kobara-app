import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WithdrawalsClient } from "./withdrawals-client";

export default async function WithdrawalsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, available_balance, pending_balance')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    redirect('/login');
  }

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <WithdrawalsClient withdrawals={withdrawals || []} merchant={merchant} />;
}
