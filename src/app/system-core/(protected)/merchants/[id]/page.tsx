import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, ShieldAlert, Store, User } from "lucide-react";

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

  // Fetch metrics
  const { data: payments } = await supabase.from('payments').select('gross_amount, status').eq('merchant_id', id);
  const successPayments = payments?.filter(p => p.status === 'succeeded') || [];
  const totalVolume = successPayments.reduce((acc, curr) => acc + (curr.gross_amount || 0), 0);

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
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              FINANCIAL METRICS
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2">TOTAL VOLUME</div>
                <div className="text-xl font-bold text-slate-200">{totalVolume.toLocaleString()} HTG</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2">SUCCESSFUL TXNS</div>
                <div className="text-xl font-bold text-slate-200">{successPayments.length}</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-2">AVAILABLE BALANCE</div>
                <div className="text-xl font-bold text-green-400">{merchant.available_balance || 0} HTG</div>
              </div>
            </div>
          </div>
        </div>

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
                  {merchant.kyc_status.toUpperCase()}
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
    </div>
  );
}

// Ensure Activity icon is imported (missed it in the first line)
import { Activity } from "lucide-react";
