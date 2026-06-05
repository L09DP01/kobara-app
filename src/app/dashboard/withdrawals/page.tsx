export const dynamic = 'force-dynamic';

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { WithdrawalsClient } from "./withdrawals-client";

export default async function WithdrawalsPage() {
  const { user, merchant, userRole, supabase } = await getCurrentUserAndMerchant();

  if (userRole !== 'owner') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center max-w-md">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">lock</span>
          <h2 className="text-xl font-bold text-white mb-2">Accès restreint</h2>
          <p className="text-slate-400">Seul le propriétaire du compte peut accéder à la gestion des retraits.</p>
        </div>
      </div>
    );
  }

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
