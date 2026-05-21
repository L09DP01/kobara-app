import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { WithdrawalsClient } from "./withdrawals-client";

export default async function WithdrawalsPage() {
  const { user, merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  const { data: settings } = await supabase
    .from('settings')
    .select('security_json')
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  const security = settings?.security_json || {};
  const twoFactorMethod = security.two_factor_method || 'none';
  const hasPasskey = security.passkeys && security.passkeys.length > 0;

  return <WithdrawalsClient 
    withdrawals={withdrawals || []} 
    merchant={merchant} 
    twoFactorMethod={twoFactorMethod} 
    hasPasskey={hasPasskey}
    userEmail={user.email!}
  />;
}
