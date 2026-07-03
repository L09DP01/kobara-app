import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, ShieldAlert, Store, Activity, CreditCard, Clock, XCircle, TestTube, Zap } from "lucide-react";

export default async function AdminMerchantDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const supabase = createAdminClient();

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();

  if (!merchant) {
    return (
      <div className="text-center p-12">
        <h1 className="text-2xl font-bold text-slate-300">MERCHANT NOT FOUND</h1>
      </div>
    );
  }

  // Fetch ALL payments for this merchant (test + live)
  const { data: allPayments } = await supabase
    .from('payments')
    .select('id, kobara_reference, gross_amount, net_amount, fee_amount, status, provider, payment_method, environment, created_at, paid_at, customers(name, email, phone)')
    .eq('merchant_id', id)
    .order('created_at', { ascending: false });

  const payments = allPayments || [];

  // Calculate totals
  const testPayments = payments.filter(p => p.environment === 'test');
  const livePayments = payments.filter(p => p.environment === 'live');
  
  const succeededLive = livePayments.filter(p => p.status === 'succeeded');
  const succeededTest = testPayments.filter(p => p.status === 'succeeded');
  const pendingAll = payments.filter(p => p.status === 'pending');
  const failedAll = payments.filter(p => p.status === 'failed');

  const totalLive = succeededLive.reduce((sum, p) => sum + Number(p.gross_amount || 0), 0);
  const totalTest = succeededTest.reduce((sum, p) => sum + Number(p.gross_amount || 0), 0);
  const totalPending = pendingAll.reduce((sum, p) => sum + Number(p.gross_amount || 0), 0);
  const totalFees = succeededLive.reduce((sum, p) => sum + Number(p.fee_amount || 0), 0);

  const statusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'expired': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const envBadge = (env: string) => {
    return env === 'test' 
      ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/system-core/merchants" className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-3">
            {merchant.business_name || 'UNNAMED_ENTITY'}
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              merchant.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
              'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {merchant.status.toUpperCase()}
            </span>
          </h1>
          <div className="text-slate-500 font-mono text-sm mt-1">ID: {merchant.id}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Store className="w-4 h-4" />
              BUSINESS INTELLIGENCE
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">EMAIL CONTACT</div>
                <div className="font-mono text-slate-200">{merchant.email}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">PHONE</div>
                <div className="font-mono text-slate-200">{merchant.phone || 'NOT_PROVIDED'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">CATEGORY</div>
                <div className="text-slate-200 uppercase">{merchant.category || 'UNDEFINED'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">ACCOUNT CREATED</div>
                <div className="text-slate-200">{new Date(merchant.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">PLAN</div>
                <div className="text-slate-200 uppercase font-bold">{merchant.plan_slug || 'NONE'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">CURRENT MODE</div>
                <div className={`font-bold uppercase ${merchant.current_environment === 'live' ? 'text-green-400' : 'text-purple-400'}`}>
                  {merchant.current_environment || 'test'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              FINANCIAL METRICS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> LIVE VOLUME</div>
                <div className="text-xl font-bold text-green-400">{totalLive.toLocaleString()} HTG</div>
                <div className="text-xs text-slate-500 mt-1">{succeededLive.length} txns</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><TestTube className="w-3 h-3" /> TEST VOLUME</div>
                <div className="text-xl font-bold text-purple-400">{totalTest.toLocaleString()} HTG</div>
                <div className="text-xs text-slate-500 mt-1">{succeededTest.length} txns</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> PENDING</div>
                <div className="text-xl font-bold text-amber-400">{totalPending.toLocaleString()} HTG</div>
                <div className="text-xs text-slate-500 mt-1">{pendingAll.length} txns</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2">KOBARA FEES</div>
                <div className="text-xl font-bold text-[#FF4A1C]">{totalFees.toLocaleString()} HTG</div>
                <div className="text-xs text-slate-500 mt-1">{failedAll.length} failed</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2">BALANCE LIVE</div>
                <div className="text-xl font-bold text-green-400">{Number(merchant.available_balance || 0).toLocaleString()} HTG</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2">BALANCE TEST</div>
                <div className="text-xl font-bold text-purple-400">{Number(merchant.available_balance_test || 0).toLocaleString()} HTG</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              SECURITY PROTOCOLS
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-2">KYC CLEARANCE LEVEL</div>
                <div className={`px-3 py-2 rounded text-sm font-bold text-center border ${
                  merchant.kyc_status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  merchant.kyc_status === 'in_review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  merchant.kyc_status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {merchant.kyc_status?.toUpperCase() || 'NOT_STARTED'}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500 mb-3">SYSTEM KILL SWITCH</div>
                {merchant.status === 'active' ? (
                  <form action={async () => {
                    'use server';
                    const adminClient = createAdminClient();
                    await adminClient.from('merchants').update({ status: 'suspended' }).eq('id', id);
                  }}>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 py-2.5 rounded font-bold transition-colors">
                      <Ban className="w-4 h-4" />
                      SUSPEND ACCOUNT
                    </button>
                    <p className="text-[10px] text-slate-500 mt-2 text-center">Instantly blocks API keys and payment links.</p>
                  </form>
                ) : (
                  <form action={async () => {
                    'use server';
                    const adminClient = createAdminClient();
                    await adminClient.from('merchants').update({ status: 'active' }).eq('id', id);
                  }}>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-600/30 py-2.5 rounded font-bold transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                      RESTORE ACCOUNT
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            ALL PAYMENTS ({payments.length})
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400">● {succeededLive.length + succeededTest.length} succeeded</span>
            <span className="text-amber-400">● {pendingAll.length} pending</span>
            <span className="text-red-400">● {failedAll.length} failed</span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">NO TRANSACTIONS RECORDED</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="text-left py-3 px-3 font-medium">ID</th>
                  <th className="text-left py-3 px-3 font-medium">REFERENCE</th>
                  <th className="text-left py-3 px-3 font-medium">CUSTOMER</th>
                  <th className="text-left py-3 px-3 font-medium">PROVIDER</th>
                  <th className="text-right py-3 px-3 font-medium">AMOUNT</th>
                  <th className="text-right py-3 px-3 font-medium">FEES</th>
                  <th className="text-right py-3 px-3 font-medium">NET</th>
                  <th className="text-center py-3 px-3 font-medium">ENV</th>
                  <th className="text-center py-3 px-3 font-medium">STATUS</th>
                  <th className="text-left py-3 px-3 font-medium">DATE</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-500" title={p.id}>
                      {p.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-300">
                      {p.kobara_reference || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {p.customers?.name || p.customers?.email || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-bold uppercase text-slate-300">
                        {p.provider || p.payment_method || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {Number(p.gross_amount || 0).toLocaleString()} HTG
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#FF4A1C] text-xs">
                      {Number(p.fee_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {Number(p.net_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${envBadge(p.environment)}`}>
                        {p.environment?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor(p.status)}`}>
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(p.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
