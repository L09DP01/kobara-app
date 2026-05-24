import { createAdminClient } from "@/utils/supabase/admin";
import { Search, Banknote, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient();

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select(`
      *,
      merchants ( business_name, available_balance )
    `)
    .order('created_at', { ascending: false });

  async function markAsPaid(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;
    const amount = Number(formData.get('amount'));
    
    const adminClient = createAdminClient();
    
    // 1. Mark withdrawal as paid
    await adminClient.from('withdrawals').update({ 
      status: 'paid',
      processed_at: new Date().toISOString()
    }).eq('id', id);

    // 2. Deduct from available balance
    // This is simplified. In a real app with high concurrency, use a Postgres RPC to decrement safely.
    const { data: merchant } = await adminClient.from('merchants').select('available_balance').eq('id', merchantId).single();
    if (merchant) {
      await adminClient.from('merchants').update({
        available_balance: Math.max(0, (merchant.available_balance || 0) - amount)
      }).eq('id', merchantId);
    }

    revalidatePath('/system-core/withdrawals');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">PAYOUTS MANAGEMENT</h1>
        <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded border border-amber-500/20 text-xs font-bold">
          {withdrawals?.filter(w => w.status === 'pending').length || 0} PENDING
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">REFERENCE</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">MERCHANT</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">AMOUNT (HTG)</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">STATUS</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {withdrawals?.map((w: any) => (
              <tr key={w.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-mono text-slate-200">{w.id.split('-')[0]}...</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">METHOD: {w.method || 'MONCASH'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-300">{w.merchants?.business_name || 'Unknown'}</div>
                  <div className="text-[10px] text-slate-500 mt-1">AVAILABLE: {w.merchants?.available_balance || 0} HTG</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-200">{w.amount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                    w.status === 'paid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    w.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {w.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {w.status === 'pending' && (
                    <form action={markAsPaid}>
                      <input type="hidden" name="id" value={w.id} />
                      <input type="hidden" name="merchant_id" value={w.merchant_id} />
                      <input type="hidden" name="amount" value={w.amount} />
                      <button type="submit" className="inline-flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/30 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                        <CheckCircle2 className="w-3 h-3" /> MARK PAID
                      </button>
                    </form>
                  )}
                  {w.status === 'paid' && (
                    <span className="text-xs text-slate-500 font-mono">{new Date(w.processed_at).toLocaleString()}</span>
                  )}
                </td>
              </tr>
            ))}
            {(!withdrawals || withdrawals.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Banknote className="w-6 h-6 opacity-20" />
                    <p>No withdrawal requests found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
