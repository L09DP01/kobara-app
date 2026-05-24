import { createAdminClient } from "@/utils/supabase/admin";
import { SearchCode } from "lucide-react";

export default async function AdminAuditPage() {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      merchants ( business_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">SECURITY AUDIT LOGS</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">TIMESTAMP</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">ACTION</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">MERCHANT</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs">IP ADDRESS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono text-xs">
            {logs?.map((l: any) => (
              <tr key={l.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4 text-slate-400">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded font-bold tracking-wider ${
                    l.action.includes('failed') || l.action.includes('error') ? 'bg-red-500/10 text-red-500' :
                    l.action.includes('login') ? 'bg-blue-500/10 text-blue-400' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {l.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {l.merchants?.business_name || 'System / Unknown'}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {l.ip_address || '0.0.0.0'}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <SearchCode className="w-6 h-6 opacity-20" />
                    <p>No audit logs found.</p>
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
