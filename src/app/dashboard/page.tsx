import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    // Should theoretically not happen if signup creates it, but as fallback
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary">Profil marchand introuvable.</p>
      </div>
    );
  }

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*, customers(name, email)')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Aggregate stats (Total Encaissé)
  // For MVP, we can aggregate here, or fetch a pre-calculated field.
  // We'll calculate it from all succeeded payments.
  const { data: succeededPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('merchant_id', merchant.id)
    .eq('status', 'succeeded');

  const totalEncaisse = succeededPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const soldeDisponible = Number(merchant.available_balance || 0);

  // Calculate success rate
  const { count: totalCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id);
  const { count: successCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('status', 'succeeded');
  
  const successRate = totalCount ? ((successCount || 0) / totalCount) * 100 : 0;

  return (
    <>
      {/* Overview Cards (Premium Minimalist) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-card rounded-xl border border-border-subtle p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <span className="font-body-base text-body-base text-text-secondary">Total Encaissé</span>
            <div className="w-8 h-8 rounded-full bg-primary-fixed/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary">{totalEncaisse.toLocaleString('fr-FR')} HTG</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-label-caps text-label-caps text-status-success bg-status-success/10 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">trending_up</span> +0.0%
              </span>
              <span className="font-body-sm text-body-sm text-text-secondary">vs mois dernier</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-border-subtle">
            <div className="h-full bg-status-success w-[70%]"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-card rounded-xl border border-border-subtle p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <span className="font-body-base text-body-base text-text-secondary">Solde Disponible</span>
            <div className="w-8 h-8 rounded-full bg-status-success/20 flex items-center justify-center text-status-success">
              <span className="material-symbols-outlined text-[18px]">wallet</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary">{soldeDisponible.toLocaleString('fr-FR')} HTG</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-label-caps text-label-caps text-text-secondary bg-surface-container px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">horizontal_rule</span> 0.0%
              </span>
              <span className="font-body-sm text-body-sm text-text-secondary">vs mois dernier</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-border-subtle">
            <div className="h-full bg-status-success w-[40%]"></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-card rounded-xl border border-border-subtle p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <span className="font-body-base text-body-base text-text-secondary">Taux de Succès</span>
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed/40 flex items-center justify-center text-tertiary-container">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary">{successRate.toFixed(1)}%</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-label-caps text-label-caps text-text-secondary bg-surface-container px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">horizontal_rule</span> 0.0%
              </span>
              <span className="font-body-sm text-body-sm text-text-secondary">vs mois dernier</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-border-subtle">
            <div className="h-full bg-tertiary-container" style={{ width: `${successRate}%` }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-card rounded-xl border border-border-subtle p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <span className="font-body-base text-body-base text-text-secondary">Revenu Mensuel</span>
            <div className="w-8 h-8 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">monitoring</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-lg text-headline-lg text-text-primary">0 HTG</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-label-caps text-label-caps text-text-secondary bg-surface-container px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">horizontal_rule</span> 0.0%
              </span>
              <span className="font-body-sm text-body-sm text-text-secondary">vs mois dernier</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-border-subtle">
            <div className="h-full bg-status-error w-[0%]"></div>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Analytics & Transactions) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Chart Section */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-text-primary">Flux Financier Mensuel</h3>
              <select className="bg-surface-container border-none text-body-sm rounded-lg focus:ring-primary p-2">
                <option>Cette année</option>
                <option>6 derniers mois</option>
                <option>Ce mois-ci</option>
              </select>
            </div>
            {/* Placeholder for Chart */}
            <div className="h-[300px] w-full bg-surface-container-lowest border border-dashed border-border-subtle rounded flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
                <div className="w-full border-t border-outline"></div>
                <div className="w-full border-t border-outline"></div>
                <div className="w-full border-t border-outline"></div>
                <div className="w-full border-t border-outline"></div>
              </div>
              <span className="text-text-secondary text-body-sm z-10 bg-surface-card px-2 py-1 rounded shadow-sm">Visualisation du graphique (Revenus vs Dépenses)</span>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-text-primary">Transactions Récentes</h3>
              <button className="text-body-sm font-semibold text-primary hover:text-text-secondary transition-colors">Voir Tout</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-container-low/50">
                    <th className="py-3 px-6 font-label-caps text-label-caps text-text-secondary font-semibold uppercase tracking-wider">Client / Ref</th>
                    <th className="py-3 px-6 font-label-caps text-label-caps text-text-secondary font-semibold uppercase tracking-wider">Montant</th>
                    <th className="py-3 px-6 font-label-caps text-label-caps text-text-secondary font-semibold uppercase tracking-wider">Méthode</th>
                    <th className="py-3 px-6 font-label-caps text-label-caps text-text-secondary font-semibold uppercase tracking-wider">Statut</th>
                    <th className="py-3 px-6 font-label-caps text-label-caps text-text-secondary font-semibold uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {recentPayments && recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-semibold text-body-sm">
                            {payment.customers?.name?.charAt(0) || "A"}
                          </div>
                          <span className="font-body-base text-body-base text-text-primary font-medium">
                            {payment.customers?.name || payment.kobara_reference}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono-code text-mono-code text-text-primary">{Number(payment.amount).toLocaleString('fr-FR')} {payment.currency}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-secondary-container/20 rounded flex items-center justify-center text-secondary">
                              <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                            </div>
                            <span className="text-body-sm text-text-secondary capitalize">{payment.provider}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-label-caps text-label-caps px-2.5 py-1 rounded-full border ${
                            payment.status === 'succeeded' ? 'bg-status-success/10 text-status-success border-status-success/20' :
                            payment.status === 'failed' ? 'bg-status-error/10 text-status-error border-status-error/20' :
                            'bg-status-warning/10 text-status-warning border-status-warning/20'
                          }`}>
                            {payment.status === 'succeeded' ? 'Payée' : payment.status === 'failed' ? 'Échouée' : 'En attente'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-body-sm text-text-secondary">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-secondary">
                        Aucune transaction récente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="flex flex-col gap-8">
          
          {/* Withdrawals Widget */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-text-primary">Statistiques de Retrait</h3>
              <button className="p-1 hover:bg-surface-container rounded-lg text-text-secondary transition-colors">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <span className="text-body-sm text-text-secondary">Aucun retrait récent.</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-border-subtle rounded-lg text-body-sm font-medium hover:bg-surface-container transition-colors text-text-primary">
              Demander un retrait
            </button>
          </div>

          {/* Notifications Pane */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-text-primary">Notifications</h3>
              <button className="text-body-sm text-text-secondary hover:text-primary transition-colors">Marquer tout comme lu</button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-status-success mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-body-base text-body-base text-text-primary">Bienvenue sur Kobara</p>
                  <p className="text-body-sm text-text-secondary">Votre compte marchand est prêt.</p>
                  <p className="text-label-caps text-text-secondary mt-1">À L'INSTANT</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
