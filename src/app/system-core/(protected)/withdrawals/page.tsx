import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { CheckCircle2, XCircle, Banknote, Clock, AlertTriangle } from "lucide-react";

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient();

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select(`*, merchants ( business_name, email, available_balance )`)
    .order('created_at', { ascending: false });

  // ---- Server Actions ----

  async function approveManualWithdrawal(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;
    const total = Number(formData.get('total')); // montant total (avec frais)

    const adminClient = createAdminClient();

    // 1. Déduire le solde maintenant
    const { data: merchant } = await adminClient.from('merchants').select('available_balance').eq('id', merchantId).single();
    if (merchant) {
      const newBalance = Math.max(0, (merchant.available_balance || 0) - total);
      await adminClient.from('merchants').update({ available_balance: newBalance }).eq('id', merchantId);
    }

    // 2. Marquer comme complété
    await adminClient.from('withdrawals').update({
      status: 'completed',
      processed_at: new Date().toISOString()
    }).eq('id', id);

    // 3. Notifier le marchand du succès
    try {
      const { data: w } = await adminClient.from('withdrawals').select('amount, total').eq('id', id).single();
      const { notifyWithdrawalSuccess } = await import('@/lib/server/notifications');
      if (w) {
        const { data: mData } = await adminClient.from('merchants').select('email').eq('id', merchantId).single();
        if (mData) await notifyWithdrawalSuccess(merchantId, mData.email, w.total || w.amount);
      }
    } catch(e) { console.error("Notify failed", e); }

    revalidatePath('/system-core/withdrawals');
  }

  async function rejectManualWithdrawal(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;

    const adminClient = createAdminClient();

    // 1. Marquer comme rejeté (pas de déduction de solde, il n'a jamais été déduit)
    await adminClient.from('withdrawals').update({
      status: 'rejected',
      processed_at: new Date().toISOString()
    }).eq('id', id);

    // 2. Notifier le marchand du rejet
    try {
      const { data: mData } = await adminClient.from('merchants').select('email').eq('id', merchantId).single();
      const { sendEmail } = await import('@/lib/server/mail');
      if (mData?.email) {
        await sendEmail({
          to: mData.email,
          subject: "Votre demande de retrait a été rejetée",
          text: `Bonjour,\n\nVotre récente demande de retrait a été examinée et rejetée par notre équipe.\n\nVotre solde n'a pas été débité. Si vous avez des questions, contactez notre support.\n\nCordialement,\nL'équipe Kobara`
        });
      }
    } catch(e) { console.error("Notify failed", e); }

    revalidatePath('/system-core/withdrawals');
  }

  async function markAsPaid(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await createAdminClient().from('withdrawals').update({
      status: 'paid',
      processed_at: new Date().toISOString()
    }).eq('id', id);
    revalidatePath('/system-core/withdrawals');
  }

  // ---- Stats ----
  const pendingApproval = withdrawals?.filter(w => w.status === 'pending_approval').length || 0;
  const pending = withdrawals?.filter(w => w.status === 'pending').length || 0;

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending_approval: { label: 'APPROBATION REQUISE', color: 'bg-red-500/10 text-red-400 border border-red-500/30' },
    pending:          { label: 'EN TRAITEMENT',       color: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
    completed:        { label: 'COMPLÉTÉ',            color: 'bg-green-500/10 text-green-400 border border-green-500/30' },
    paid:             { label: 'PAYÉ',                color: 'bg-green-500/10 text-green-400 border border-green-500/30' },
    rejected:         { label: 'REJETÉ',              color: 'bg-slate-500/10 text-slate-400 border border-slate-500/30' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">PAYOUTS MANAGEMENT</h1>
        <div className="flex gap-3">
          {pendingApproval > 0 && (
            <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              {pendingApproval} APPROBATION REQUISE
            </div>
          )}
          {pending > 0 && (
            <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded border border-amber-500/20 text-xs font-bold">
              {pending} EN TRAITEMENT
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-5 py-4 font-semibold tracking-wider text-xs">RÉFÉRENCE</th>
              <th className="px-5 py-4 font-semibold tracking-wider text-xs">MARCHAND</th>
              <th className="px-5 py-4 font-semibold tracking-wider text-xs">MÉTHODE</th>
              <th className="px-5 py-4 font-semibold tracking-wider text-xs">MONTANT NET</th>
              <th className="px-5 py-4 font-semibold tracking-wider text-xs">STATUT</th>
              <th className="px-5 py-4 font-semibold tracking-wider text-xs text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {withdrawals?.map((w: any) => (
              <tr key={w.id} className={`hover:bg-slate-800/30 transition-colors ${w.status === 'pending_approval' ? 'bg-red-950/10' : ''}`}>
                <td className="px-5 py-4">
                  <div className="font-mono text-slate-200 text-xs">{w.kobara_reference || w.id.split('-')[0] + '...'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{new Date(w.created_at).toLocaleString('fr-FR')}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-300">{w.merchants?.business_name || 'Unknown'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{w.wallet || '—'}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    w.provider === 'natcash' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    w.provider === 'zelle'   ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    w.provider === 'b2b transfer' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {(w.provider || 'MONCASH').toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-200">{Number(w.amount || 0).toLocaleString('fr-FR')} HTG</div>
                  {w.fees > 0 && <div className="text-[10px] text-slate-500">Frais: {Number(w.fees || 0).toLocaleString('fr-FR')} HTG</div>}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${statusConfig[w.status]?.color || 'bg-slate-500/10 text-slate-400'}`}>
                    {statusConfig[w.status]?.label || w.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* NatCash / Zelle en attente d'approbation */}
                    {w.status === 'pending_approval' && (
                      <>
                        <form action={approveManualWithdrawal}>
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="merchant_id" value={w.merchant_id} />
                          <input type="hidden" name="total" value={w.total || w.amount} />
                          <button type="submit" className="inline-flex items-center gap-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/30 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                            <CheckCircle2 className="w-3 h-3" /> APPROUVER
                          </button>
                        </form>
                        <form action={rejectManualWithdrawal}>
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="merchant_id" value={w.merchant_id} />
                          <button type="submit" className="inline-flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                            <XCircle className="w-3 h-3" /> REJETER
                          </button>
                        </form>
                      </>
                    )}

                    {/* MonCash en attente de confirmation */}
                    {w.status === 'pending' && (
                      <form action={markAsPaid}>
                        <input type="hidden" name="id" value={w.id} />
                        <button type="submit" className="inline-flex items-center gap-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-500 border border-green-600/30 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                          <CheckCircle2 className="w-3 h-3" /> MARK PAID
                        </button>
                      </form>
                    )}

                    {(w.status === 'paid' || w.status === 'completed') && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {w.processed_at ? new Date(w.processed_at).toLocaleString('fr-FR') : '—'}
                      </span>
                    )}

                    {w.status === 'rejected' && (
                      <span className="text-[10px] text-slate-500">Rejeté</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!withdrawals || withdrawals.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Banknote className="w-6 h-6 opacity-20" />
                    <p>Aucune demande de retrait.</p>
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
