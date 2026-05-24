import { createAdminClient } from "@/utils/supabase/admin";
import { Activity, ArrowUpRight, Banknote, ShieldAlert, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch basic stats
  const { count: merchantCount } = await supabase.from('merchants').select('*', { count: 'exact', head: true });
  const { count: kycPending } = await supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('kyc_status', 'in_review');
  const { count: paymentsCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'succeeded');
  
  // Calculate Volume and Revenue
  const { data: payments } = await supabase.from('payments').select('gross_amount, fee_amount').eq('status', 'succeeded');
  
  const totalVolume = payments?.reduce((acc, curr) => acc + (curr.gross_amount || 0), 0) || 0;
  const totalRevenue = payments?.reduce((acc, curr) => acc + (curr.fee_amount || 0), 0) || 0;

  // Recent Activity Logs (Audit)
  const { data: recentMerchants } = await supabase
    .from('merchants')
    .select('id, business_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">SYSTEM OVERVIEW</h1>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded">
          <Activity className="w-3 h-3" />
          SYSTEM NOMINAL
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Banknote className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-slate-400 text-xs font-semibold mb-1 tracking-wider">TOTAL VOLUME (HTG)</div>
          <div className="text-2xl font-bold text-slate-100">{totalVolume.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400 border border-green-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-slate-400 text-xs font-semibold mb-1 tracking-wider">KOBARA REVENUE</div>
          <div className="text-2xl font-bold text-slate-100">{totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-slate-400 text-xs font-semibold mb-1 tracking-wider">TOTAL MERCHANTS</div>
          <div className="text-2xl font-bold text-slate-100">{merchantCount || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-slate-400 text-xs font-semibold mb-1 tracking-wider">KYC IN REVIEW</div>
          <div className="text-2xl font-bold text-slate-100">{kycPending || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Graph Placeholder */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-slate-300 mb-6 tracking-wider">TRANSACTION VOLUME (30 DAYS)</h2>
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-700/50 rounded bg-slate-900/50">
            <div className="text-slate-500 text-sm flex flex-col items-center gap-2">
              <Activity className="w-6 h-6 opacity-50" />
              <span>Chart Module Loading...</span>
            </div>
          </div>
        </div>

        {/* Recent Merchants */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-6 tracking-wider">LATEST ONBOARDINGS</h2>
          <div className="space-y-4">
            {recentMerchants?.map(merchant => (
              <div key={merchant.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{merchant.business_name || 'Unnamed Business'}</div>
                  <div className="text-xs text-slate-500">{new Date(merchant.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">NEW</div>
              </div>
            ))}
            {(!recentMerchants || recentMerchants.length === 0) && (
              <div className="text-sm text-slate-500 text-center py-4">No merchants found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
