import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { WithdrawalsClient } from "./withdrawals-client";

export default async function WithdrawalsPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <WithdrawalsClient withdrawals={withdrawals || []} merchant={merchant} />;
}
