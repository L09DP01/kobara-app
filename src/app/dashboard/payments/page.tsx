import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    redirect('/login');
  }

  // Fetch all payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*, customers(name, email)')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  // Basic stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalToday = 0;
  let totalWeek = 0;
  let refundCount = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (payments) {
    payments.forEach(p => {
      const pDate = new Date(p.created_at);
      if (p.status === 'succeeded') {
        if (pDate >= today) {
          totalToday += Number(p.amount);
        }
        if (pDate >= oneWeekAgo) {
          totalWeek += Number(p.amount);
        }
      }
      if (p.status === 'refunded') {
        refundCount++;
      }
    });
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-12 pb-12">
      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-body-sm font-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm" 
            placeholder="Rechercher par ID, client ou montant..." 
            type="text"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filtres
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exporter
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stat Card 1 */}
        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary-fixed-dim transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Total Encaissé ce jour</p>
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-status-success">
              <span className="material-symbols-outlined text-[18px]">monetization_on</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-lg text-text-primary">{totalToday.toLocaleString('fr-FR')} HTG</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-status-success font-body-sm">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+0.0%</span>
            <span className="text-text-secondary ml-1">vs hier</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary-fixed-dim transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Volume Hebdomadaire</p>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-lg text-text-primary">{totalWeek.toLocaleString('fr-FR')} HTG</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-text-secondary font-body-sm">
            <span className="material-symbols-outlined text-[16px]">trending_flat</span>
            <span>Stable</span>
            <span className="ml-1">vs sem. passée</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary-fixed-dim transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Remboursements</p>
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-status-error">
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-lg text-text-primary">0 HTG</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-text-secondary font-body-sm">
            <span>{refundCount} transaction(s)</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest">
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Montant</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Client / Ref</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Statut</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Méthode</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Date</th>
                <th className="py-4 px-6 text-right font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border-subtle">
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="font-medium">{Number(payment.amount).toLocaleString('fr-FR')} {payment.currency}</div>
                      <div className="text-text-secondary text-xs">Net: {Number(payment.net_amount).toLocaleString('fr-FR')} {payment.currency}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{payment.customers?.name || payment.kobara_reference}</div>
                      <div className="text-text-secondary text-xs">{payment.customers?.email || "N/A"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'succeeded' ? 'bg-status-success/10 text-status-success' :
                        payment.status === 'failed' ? 'bg-status-error/10 text-status-error' :
                        'bg-status-warning/10 text-status-warning'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          payment.status === 'succeeded' ? 'bg-status-success' :
                          payment.status === 'failed' ? 'bg-status-error' :
                          'bg-status-warning'
                        }`}></span>
                        {payment.status === 'succeeded' ? 'Succès' : payment.status === 'failed' ? 'Échoué' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-text-secondary">smartphone</span>
                        <span className="capitalize">{payment.provider}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      <div>{new Date(payment.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs">{new Date(payment.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-text-secondary hover:text-primary transition-colors font-medium">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    Aucun paiement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        {payments && payments.length > 0 && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between">
            <p className="font-body-sm text-text-secondary">Affichage de 1 à {payments.length} sur {payments.length} résultats</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-border-subtle rounded text-body-sm font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50" disabled>Précédent</button>
              <button className="px-3 py-1 border border-border-subtle rounded text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors disabled:opacity-50" disabled>Suivant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
