export const dynamic = 'force-dynamic';

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { WithdrawalsClient } from "./withdrawals-client";

export default async function WithdrawalsPage() {
  const { user, merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('environment', merchant.current_environment || 'test')
    .order('created_at', { ascending: false });

  const { data: settings } = await supabase
    .from('settings')
    .select('security_json, settings_json')
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  const security = settings?.security_json || {};
  const generalSettings = settings?.settings_json || {};
  const twoFactorMethod = security.two_factor_method || 'none';
  const savedMoncashNumber = generalSettings.saved_moncash_number || '';

  return <WithdrawalsClient 
    withdrawals={withdrawals || []} 
    merchant={merchant} 
    twoFactorMethod={twoFactorMethod} 
    userEmail={user.email!}
    savedMoncashNumber={savedMoncashNumber}
  />;
}
