import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminMerchantsPage() {
  const supabase = createAdminClient();

  const { data: merchants } = await supabase
    .from('merchants')
    .select(`
      id,
      business_name,
      email,
      status,
      kyc_status,
      created_at
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-b border-slate-800 pb-4">MERCHANTS DIRECTORY</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="p-4 font-semibold">BUSINESS NAME</th>
              <th className="p-4 font-semibold">EMAIL</th>
              <th className="p-4 font-semibold">STATUS</th>
              <th className="p-4 font-semibold">KYC</th>
              <th className="p-4 font-semibold">JOINED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {merchants?.map(m => (
              <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-medium text-slate-200">{m.business_name || 'N/A'}</td>
                <td className="p-4 text-slate-400">{m.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    m.status === 'active' ? 'bg-green-950 text-green-400 border border-green-900' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    m.kyc_status === 'approved' ? 'bg-green-950 text-green-400 border border-green-900' :
                    m.kyc_status === 'in_review' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                    m.kyc_status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-900' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {m.kyc_status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-slate-500">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!merchants || merchants.length === 0) && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No merchants found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
