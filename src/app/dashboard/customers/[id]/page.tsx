import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { merchant } = await getCurrentUserAndMerchant();

  if (!merchant) {
    redirect('/login');
  }

  const supabase = createAdminClient();

  // Fetch customer and their payments
  const { data: customer } = await supabase
    .from('customers')
    .select(`
      *,
      payments (
        id,
        kobara_reference,
        amount,
        net_amount,
        fee_amount,
        currency,
        status,
        provider,
        payment_method,
        created_at,
        paid_at
      )
    `)
    .eq('id', params.id)
    .eq('merchant_id', merchant.id)
    .single();

  if (!customer) {
    return notFound();
  }

  const payments = customer.payments || [];
  const successfulPayments = payments.filter((p: any) => p.status === 'succeeded' || p.status === 'completed');
  const totalVolume = successfulPayments.reduce((sum: number, p: any) => sum + Number(p.net_amount || p.amount), 0);
  const totalFees = successfulPayments.reduce((sum: number, p: any) => sum + Number(p.fee_amount || 0), 0);

  // Sort payments by date descending
  payments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers" className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-display-sm font-bold text-text-primary tracking-tight">Détails du Client</h1>
            <p className="text-text-secondary mt-1">Consultez l'historique et les informations de {customer.name || 'ce client'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl">account_circle</span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center text-white font-bold text-2xl shadow-sm`}>
                {(customer.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">{customer.name || 'Client Inconnu'}</h2>
                <p className="text-sm text-text-secondary">Client depuis {new Date(customer.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">mail</span>
                  {customer.email || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">phone</span>
                  {customer.phone || 'Non renseigné'}
                </p>
              </div>
              {customer.wallet && (
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Portefeuille par défaut</p>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">account_balance_wallet</span>
                    {customer.wallet}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6">
            <h3 className="font-bold text-text-primary mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Volume Total Net</span>
                <span className="font-bold text-text-primary">{totalVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Total Frais</span>
                <span className="font-bold text-text-secondary">{totalFees.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Paiements Réussis</span>
                <span className="font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full text-xs">
                  {successfulPayments.length} / {payments.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
              <h2 className="text-lg font-bold text-text-primary">Historique des transactions</h2>
              <span className="text-sm text-text-secondary">{payments.length} transactions</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-border-subtle text-xs uppercase tracking-wider text-text-secondary font-semibold">
                    <th className="py-3 px-6">Référence</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Méthode</th>
                    <th className="py-3 px-6 text-right">Montant Brut</th>
                    <th className="py-3 px-6">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border-subtle">
                  {payments.length > 0 ? payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3 px-6 font-mono text-xs text-text-secondary">{payment.kobara_reference}</td>
                      <td className="py-3 px-6">
                        <div className="font-medium text-text-primary">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-text-secondary">{new Date(payment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[14px]">smartphone</span>
                          </div>
                          <span className="capitalize font-medium text-text-primary">{payment.provider}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right font-semibold text-text-primary">
                        {payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {payment.currency}
                      </td>
                      <td className="py-3 px-6">
                        {payment.status === 'succeeded' || payment.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-success/10 text-status-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                            Succès
                          </span>
                        ) : payment.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-error/10 text-status-error">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-error"></span>
                            Échoué
                          </span>
                        ) : payment.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-warning/10 text-status-warning">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span>
                            En attente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary"></span>
                            {payment.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-secondary">
                        Aucune transaction pour ce client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
