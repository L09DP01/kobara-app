import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Basic stats
  const { count: merchantCount } = await supabase.from('merchants').select('*', { count: 'exact', head: true });
  const { count: kycPending } = await supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('kyc_status', 'in_review');
  const { count: paymentsCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'succeeded');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-b border-slate-800 pb-4">SYSTEM DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">TOTAL MERCHANTS</div>
          <div className="text-4xl font-bold text-white">{merchantCount || 0}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">KYC PENDING REVIEW</div>
          <div className="text-4xl font-bold text-amber-500">{kycPending || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <div className="text-slate-400 text-sm mb-2">SUCCESSFUL PAYMENTS</div>
          <div className="text-4xl font-bold text-green-500">{paymentsCount || 0}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg mt-8">
        <h2 className="text-lg font-bold mb-4">SYSTEM STATUS</h2>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-500 font-bold">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}
