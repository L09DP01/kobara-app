import { createAdminClient } from "@/utils/supabase/admin";
import { Search, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default async function AdminTransactionsPage() {
  const supabase = createAdminClient();

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      merchants ( business_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100); // Pagination in a real app

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">GLOBAL LEDGER</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search TXN ID..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors text-slate-200"
          />
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">TRANSACTION ID</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">MERCHANT</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">AMOUNT (HTG)</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">STATUS</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {payments?.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-mono text-slate-200">{p.id.split('-')[0]}...{p.id.split('-').pop()}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase">EXT: {p.external_reference || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-300">{p.merchants?.business_name || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {p.status === 'succeeded' ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-bold text-slate-200">{p.gross_amount}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">FEE: {p.fee_amount}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                    p.status === 'succeeded' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    p.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                  {new Date(p.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-6 h-6 opacity-20" />
                    <p>No transactions found in the ledger.</p>
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
