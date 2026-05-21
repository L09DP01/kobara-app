import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import Link from "next/link";
import { PaymentsFilter } from "./payments-filter";

export default async function PaymentsPage({
  searchParams
}: {
  searchParams: { q?: string, status?: string }
}) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const queryParams = await searchParams; // In Next.js 15, searchParams might be a Promise, but in 14 it's sync. Safe to await or just use directly in modern Next
  const searchQ = queryParams?.q || '';
  const filterStatus = queryParams?.status || 'all';

  let query = supabase
    .from('payments')
    .select('*, customers(name, email)')
    .eq('merchant_id', merchant.id);

  if (filterStatus !== 'all') {
    query = query.eq('status', filterStatus);
  }

  const { data: payments } = await query.order('created_at', { ascending: false });

  // Filtering by search term (done in-memory for simpler cross-table text search without complex setup)
  const filteredPayments = payments ? payments.filter(p => {
    if (!searchQ) return true;
    const lowerQ = searchQ.toLowerCase();
    const customerName = p.customers?.name?.toLowerCase() || '';
    const customerEmail = p.customers?.email?.toLowerCase() || '';
    const ref = (p.kobara_reference || '').toLowerCase();
    const amt = p.amount?.toString() || '';
    return customerName.includes(lowerQ) || customerEmail.includes(lowerQ) || ref.includes(lowerQ) || amt.includes(lowerQ);
  }) : [];

  // Basic stats (computed on all payments or filtered? Usually stats are global, so let's re-fetch or just accept filtered if stats change. I'll fetch global stats via a separate query for accuracy if needed, but since we already have the filtered list, let's keep the global stats from a separate count if we want, OR just use the displayed ones.)
  // Actually, to keep stats accurate regardless of filters, I'll compute them on all payments by doing a quick fetch of just amount and status
  const { data: allPaymentsForStats } = await supabase
    .from('payments')
    .select('amount, net_amount, status, created_at')
    .eq('merchant_id', merchant.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalToday = 0;
  let totalWeek = 0;
  let refundCount = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (allPaymentsForStats) {
    allPaymentsForStats.forEach(p => {
      const pDate = new Date(p.created_at);
      if (p.status === 'succeeded') {
        if (pDate >= today) {
          totalToday += Number(p.net_amount || p.amount);
        }
        if (pDate >= oneWeekAgo) {
          totalWeek += Number(p.net_amount || p.amount);
        }
      }
      if (p.status === 'refunded') {
        refundCount++;
      }
    });
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-8 pb-16">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-text-primary text-2xl tracking-tight">Paiements</h1>
        <p className="font-body-sm text-text-secondary">Suivez, filtrez et gérez toutes vos transactions en un seul endroit.</p>
      </div>

      <PaymentsFilter />

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Total Encaissé */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-success rounded-l-2xl"></div>
          <div className="p-6 pl-5">
            <div className="flex justify-between items-start mb-4">
              <p className="font-body-sm text-text-secondary">Total Encaissé ce jour</p>
              <div className="h-10 w-10 rounded-xl bg-status-success/10 flex items-center justify-center text-status-success">
                <span className="material-symbols-outlined text-[22px]">monetization_on</span>
              </div>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">{totalToday.toLocaleString('fr-FR')} HTG</h3>
            <div className="mt-3 flex items-center gap-1 text-status-success font-body-sm">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+0.0%</span>
              <span className="text-text-secondary ml-1">vs hier</span>
            </div>
          </div>
          {/* Subtle background pattern */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.04] text-status-success">
            <span className="material-symbols-outlined text-[96px]">monetization_on</span>
          </div>
        </div>

        {/* Card: Volume Hebdo */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
          <div className="p-6 pl-5">
            <div className="flex justify-between items-start mb-4">
              <p className="font-body-sm text-text-secondary">Volume Hebdomadaire</p>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-[22px]">bar_chart</span>
              </div>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">{totalWeek.toLocaleString('fr-FR')} HTG</h3>
            <div className="mt-3 flex items-center gap-1 text-text-secondary font-body-sm">
              <span className="material-symbols-outlined text-[16px]">trending_flat</span>
              <span>Stable</span>
              <span className="ml-1">vs sem. passée</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.04] text-blue-500">
            <span className="material-symbols-outlined text-[96px]">bar_chart</span>
          </div>
        </div>

        {/* Card: Remboursements */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error rounded-l-2xl"></div>
          <div className="p-6 pl-5">
            <div className="flex justify-between items-start mb-4">
              <p className="font-body-sm text-text-secondary">Remboursements</p>
              <div className="h-10 w-10 rounded-xl bg-status-error/10 flex items-center justify-center text-status-error">
                <span className="material-symbols-outlined text-[22px]">currency_exchange</span>
              </div>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">0 HTG</h3>
            <div className="mt-3 flex items-center gap-1 text-text-secondary font-body-sm">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>{refundCount} transaction(s)</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.04] text-status-error">
            <span className="material-symbols-outlined text-[96px]">currency_exchange</span>
          </div>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest">
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Client</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Montant</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Statut</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Méthode</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Date</th>
                <th className="py-4 px-6 text-right font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary">
              {filteredPayments && filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className={`group cursor-pointer hover:bg-surface-container-low transition-all duration-150 border-l-[3px] border-b border-b-border-subtle ${
                    payment.status === 'succeeded' ? 'border-l-status-success' :
                    payment.status === 'failed' ? 'border-l-status-error' :
                    'border-l-status-warning'
                  }`}>
                    {/* Client with Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          payment.status === 'succeeded' ? 'bg-status-success' :
                          payment.status === 'failed' ? 'bg-status-error' :
                          'bg-status-warning'
                        }`}>
                          {(payment.customers?.name || 'CI').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate">{payment.customers?.name || 'Client Inconnu'}</div>
                          <div className="text-text-secondary text-xs font-mono-code truncate">{payment.transaction_reference || `KOB-${payment.id.substring(0, 8).toUpperCase()}`}</div>
                        </div>
                      </div>
                    </td>
                    {/* Montant */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-text-primary">+{Number(payment.net_amount || payment.amount).toLocaleString('fr-FR')} {payment.currency}</div>
                      <div className="text-text-secondary text-xs mt-0.5">Brut: {Number(payment.gross_amount || payment.amount).toLocaleString('fr-FR')} {payment.currency}</div>
                    </td>
                    {/* Statut */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'succeeded' ? 'bg-status-success/10 text-status-success' :
                        payment.status === 'failed' ? 'bg-status-error/10 text-status-error' :
                        'bg-status-warning/10 text-status-warning'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          payment.status === 'succeeded' ? 'bg-status-success' :
                          payment.status === 'failed' ? 'bg-status-error' :
                          'bg-status-warning'
                        }`}></span>
                        {payment.status === 'succeeded' ? 'Succès' : payment.status === 'failed' ? 'Échoué' : 'En attente'}
                      </span>
                    </td>
                    {/* Méthode */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <span className="material-symbols-outlined text-[18px]">smartphone</span>
                        <span className="capitalize text-text-primary font-medium">{payment.provider}</span>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="py-4 px-6 text-text-secondary">
                      <div className="font-medium text-text-primary">{new Date(payment.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs mt-0.5">{new Date(payment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <Link href={`/dashboard/payments/${payment.id}`} className="inline-flex items-center gap-1 text-text-secondary hover:text-primary font-medium transition-colors duration-150 group-hover:text-primary">
                        <span className="text-sm">Détails</span>
                        <span className="material-symbols-outlined text-[16px] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 rounded-2xl bg-surface-container flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-[40px] text-text-secondary/50">receipt_long</span>
                      </div>
                      <h3 className="font-headline-md text-text-primary mb-2">Aucun paiement pour le moment</h3>
                      <p className="font-body-sm text-text-secondary max-w-sm mb-6">Créez votre premier lien de paiement et commencez à recevoir des paiements MonCash en quelques secondes.</p>
                      <Link href="/dashboard/payment-links" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-body-sm font-semibold hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add_link</span>
                        Créer un lien de paiement
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        {filteredPayments && filteredPayments.length > 0 && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-body-sm text-text-secondary">Affichage de <span className="font-semibold text-text-primary">1</span> à <span className="font-semibold text-text-primary">{filteredPayments.length}</span> sur <span className="font-semibold text-text-primary">{filteredPayments.length}</span> résultats</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-border-subtle rounded-lg text-body-sm font-medium text-text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">chevron_left</span> Précédent</span>
              </button>
              <button className="px-4 py-2 border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                <span className="flex items-center gap-1">Suivant <span className="material-symbols-outlined text-[16px]">chevron_right</span></span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
