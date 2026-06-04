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
          <Link href="/customers" className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-display-sm font-bold text-slate-900 tracking-tight">Détails du Client</h1>
            <p className="text-slate-500 mt-1">Consultez l'historique et les informations de {customer.name || 'ce client'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl">account_circle</span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-2xl shadow-sm`}>
                {(customer.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{customer.name || 'Client Inconnu'}</h2>
                <p className="text-sm text-slate-500">Client depuis {new Date(customer.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                  {customer.email || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">phone</span>
                  {customer.phone || 'Non renseigné'}
                </p>
              </div>
              {customer.wallet && (
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Portefeuille par défaut</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">account_balance_wallet</span>
                    {customer.wallet}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-500">Volume Total Net</span>
                <span className="font-bold text-slate-900">{totalVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-500">Total Frais</span>
                <span className="font-bold text-slate-500">{totalFees.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Paiements Réussis</span>
                <span className="font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs">
                  {successfulPayments.length} / {payments.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Historique des transactions</h2>
              <span className="text-sm text-slate-500 font-bold">{payments.length} transactions</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-6">Référence</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Méthode</th>
                    <th className="py-3 px-6 text-right">Montant Brut</th>
                    <th className="py-3 px-6">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {payments.length > 0 ? payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-6 font-mono text-xs text-slate-900 font-bold">{payment.kobara_reference}</td>
                      <td className="py-3 px-6">
                        <div className="font-bold text-slate-900">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center text-orange-500">
                            <span className="material-symbols-outlined text-[14px]">smartphone</span>
                          </div>
                          <span className="capitalize font-bold text-slate-900">{payment.provider}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-slate-900">
                        {payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {payment.currency}
                      </td>
                      <td className="py-3 px-6">
                        {payment.status === 'succeeded' || payment.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Succès
                          </span>
                        ) : payment.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Échoué
                          </span>
                        ) : payment.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            En attente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {payment.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-bold">
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
