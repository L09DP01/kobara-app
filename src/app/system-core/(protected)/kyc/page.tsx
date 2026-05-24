import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { Check, X, ShieldAlert, FileText, Image as ImageIcon } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminKYCPage() {
  const supabase = createAdminClient();

  const { data: rawProfiles } = await supabase
    .from('kyc_profiles')
    .select(`
      *,
      merchants!inner ( id, business_name, email, kyc_status )
    `)
    .eq('merchants.kyc_status', 'in_review')
    .order('created_at', { ascending: false });

  // Generate signed URLs for the images
  const profiles = await Promise.all((rawProfiles || []).map(async (p: any) => {
    let signed_front_url = null;
    let signed_selfie_url = null;
    
    if (p.document_front_url && !p.document_front_url.startsWith('http')) {
      const { data } = await supabase.storage.from('kyc_documents').createSignedUrl(p.document_front_url, 3600);
      signed_front_url = data?.signedUrl || null;
    } else {
      signed_front_url = p.document_front_url; // It might be a mock https:// url
    }

    if (p.selfie_url && !p.selfie_url.startsWith('http')) {
      const { data } = await supabase.storage.from('kyc_documents').createSignedUrl(p.selfie_url, 3600);
      signed_selfie_url = data?.signedUrl || null;
    } else {
      signed_selfie_url = p.selfie_url;
    }

    return { ...p, signed_front_url, signed_selfie_url };
  }));

  async function approveKYC(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;
    
    const adminClient = createAdminClient();
    
    // Update KYC profile
    await adminClient.from('kyc_profiles').update({ 
      status: 'approved',
      rejection_reason: null
    }).eq('id', id);

    // Update merchant
    await adminClient.from('merchants').update({ 
      kyc_status: 'approved' 
    }).eq('id', merchantId);

    revalidatePath('/system-core/kyc');
  }

  async function rejectKYC(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;
    const reason = formData.get('reason') as string || 'Document invalide ou illisible (Vérification manuelle)';
    
    const adminClient = createAdminClient();
    
    // Update KYC profile
    await adminClient.from('kyc_profiles').update({ 
      status: 'rejected',
      rejection_reason: reason
    }).eq('id', id);

    // Update merchant
    await adminClient.from('merchants').update({ 
      kyc_status: 'rejected' 
    }).eq('id', merchantId);

    revalidatePath('/system-core/kyc');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          KYC MANUAL REVIEW
        </h1>
        <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded border border-amber-500/20 text-xs font-bold">
          {profiles?.length || 0} PENDING
        </div>
      </div>

      {(!profiles || profiles.length === 0) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-12 h-12 text-slate-700 mb-4" />
          <h2 className="text-lg font-bold text-slate-300">QUEUE EMPTY</h2>
          <p className="text-slate-500 mt-2">No KYC profiles currently require manual intervention.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {profiles.map((p: any) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-200">{p.merchants?.business_name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500 font-mono">{p.merchants?.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">SUBMITTED ON</div>
                  <div className="text-sm font-mono text-slate-200">{new Date(p.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> EXTRACTED DATA
                  </h3>
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-sm space-y-2">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">FIRST NAME:</span>
                      <span className="col-span-2 text-slate-300">{p.full_name?.split(' ')[0] || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">LAST NAME:</span>
                      <span className="col-span-2 text-slate-300">{p.full_name?.split(' ').slice(1).join(' ') || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">DOC TYPE:</span>
                      <span className="col-span-2 text-slate-300 uppercase">{p.document_type || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">DOC NUMBER:</span>
                      <span className="col-span-2 text-slate-300">{p.document_number_hash ? '***' + p.document_number_hash.slice(-4) : 'N/A'}</span>
                    </div>
                  </div>

                  {p.rejection_reason && (
                    <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded text-xs text-red-400">
                      <strong>AI WARNING:</strong> {p.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> DOCUMENTS
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[4/3] bg-slate-950 border border-slate-800 rounded flex items-center justify-center relative overflow-hidden group">
                      {p.signed_front_url ? (
                        <img src={p.signed_front_url} alt="ID Document" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 text-xs">NO DOC</span>
                      )}
                      {p.signed_front_url && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={p.signed_front_url} target="_blank" className="text-xs font-bold text-white border border-slate-600 px-3 py-1 rounded hover:bg-slate-800">VIEW FULL</Link>
                        </div>
                      )}
                    </div>
                    <div className="aspect-[4/3] bg-slate-950 border border-slate-800 rounded flex items-center justify-center relative overflow-hidden group">
                      {p.signed_selfie_url ? (
                        <img src={p.signed_selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 text-xs">NO SELFIE</span>
                      )}
                      {p.signed_selfie_url && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={p.signed_selfie_url} target="_blank" className="text-xs font-bold text-white border border-slate-600 px-3 py-1 rounded hover:bg-slate-800">VIEW FULL</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-end gap-3">
                <form action={rejectKYC} className="flex-1 max-w-xs flex gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="merchant_id" value={p.merchant_id} />
                  <input type="text" name="reason" placeholder="Reason (optional)" className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 text-xs text-slate-200 focus:outline-none focus:border-red-500" />
                  <button type="submit" className="flex items-center gap-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 px-4 py-2 rounded text-xs font-bold transition-colors">
                    <X className="w-3 h-3" /> REJECT
                  </button>
                </form>

                <form action={approveKYC}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="merchant_id" value={p.merchant_id} />
                  <button type="submit" className="h-full flex items-center gap-1 bg-green-600 text-white px-6 py-2 rounded text-xs font-bold hover:bg-green-700 transition-colors shadow-[0_0_10px_rgba(22,163,74,0.3)]">
                    <Check className="w-3 h-3" /> APPROVE
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
