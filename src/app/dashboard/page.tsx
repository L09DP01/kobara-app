import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import Link from "next/link";
import RevenueChart from "./analytics/RevenueChart";

export default async function DashboardPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*, customers(name, email)')
    .eq('merchant_id', merchant.id)
    .eq('environment', merchant.current_environment || 'test')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent withdrawals
  const { data: recentWithdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('environment', merchant.current_environment || 'test')
    .order('created_at', { ascending: false })
    .limit(5);

  // Aggregate stats (Total Encaissé)
  const { data: succeededPayments } = await supabase
    .from('payments')
    .select('amount, net_amount, created_at')
    .eq('merchant_id', merchant.id)
    .eq('environment', merchant.current_environment || 'test')
    .eq('status', 'succeeded');

  const totalEncaisse = succeededPayments?.reduce((sum, p) => sum + Number(p.net_amount || p.amount), 0) || 0;
  const soldeDisponible = merchant.current_environment === 'test' 
    ? Number(merchant.available_balance_test || 0) 
    : Number(merchant.available_balance || 0);

  // Calculate success rate
  const { count: totalCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('environment', merchant.current_environment || 'test');
  const { count: successCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('environment', merchant.current_environment || 'test').eq('status', 'succeeded');
  
  const successRate = totalCount ? ((successCount || 0) / totalCount) * 100 : 0;

  // Monthly revenue
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = succeededPayments?.filter(p => new Date(p.created_at) >= monthStart).reduce((sum, p) => sum + Number(p.net_amount || p.amount), 0) || 0;

  // Prepare Chart Data (Group last 30 days)
  const chartDataMap = new Map();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (let i = 0; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (30 - i));
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    chartDataMap.set(dateStr, 0);
  }

  if (succeededPayments) {
    succeededPayments.forEach(p => {
      if (!p.created_at) return;
      const d = new Date(p.created_at);
      if (d >= thirtyDaysAgo) {
        const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        if (chartDataMap.has(dateStr)) {
          chartDataMap.set(dateStr, chartDataMap.get(dateStr) + Number(p.net_amount || p.amount));
        }
      }
    });
  }

  const chartData = Array.from(chartDataMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  // Greeting based on time
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <>
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {greeting}, {merchant.business_name} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Voici un aperçu de votre activité aujourd'hui.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[18px] text-slate-500">calendar_today</span>
            {now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
          </button>
          <Link href="/payment-links" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Créer un lien de paiement
          </Link>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Card 1 - Total Encaissé */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-600 font-bold">Total Encaissé</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{totalEncaisse.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-400">HTG</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12.4%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* Card 2 - Solde Disponible */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-600 font-bold">Solde Disponible</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <span className="material-symbols-outlined text-[22px]">credit_card</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{soldeDisponible.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-400">HTG</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 8.7%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* Card 3 - Taux de Succès */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-600 font-bold">Taux de Succès</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{successRate.toFixed(1)}<span className="text-sm font-medium text-slate-400">%</span></h3>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-3">
              <div className="bg-blue-600 h-1 rounded-full transition-all duration-500" style={{ width: `${successRate}%` }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 2.1%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* Card 4 - Revenu Mensuel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-600 font-bold">Revenu Mensuel</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-[22px]">monitoring</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{monthlyRevenue.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-400">HTG</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-bold">
              0%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">vs mois dernier</span>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Chart Section */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Flux Financier</h3>
              <div className="flex items-center bg-slate-100/50 border border-slate-200 rounded-lg p-1">
                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-900 transition-colors">7j</button>
                <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-orange-500 text-white shadow-sm">30j</button>
                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-900 transition-colors">90j</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <RevenueChart data={chartData} />
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Transactions Récentes</h3>
              <Link href="/payments" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                Voir Tout
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-3 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">Client</th>
                    <th className="py-3 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">Montant</th>
                    <th className="hidden sm:table-cell py-3 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">Méthode</th>
                    <th className="py-3 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">Statut</th>
                    <th className="hidden md:table-cell py-3 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments && recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200">
                            {payment.customers?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm text-slate-900 font-semibold truncate max-w-[140px]">
                            {payment.customers?.name || payment.kobara_reference}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-bold text-slate-900">+{Number(payment.net_amount || payment.amount).toLocaleString('fr-FR')} <span className="text-xs text-slate-500 font-medium">{payment.currency}</span></div>
                        </td>
                        <td className="hidden sm:table-cell py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">smartphone</span>
                            <span className="text-sm text-slate-600 font-medium capitalize">{payment.provider}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            payment.status === 'succeeded' ? 'bg-green-50 text-green-700 border border-green-200' :
                            payment.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              payment.status === 'succeeded' ? 'bg-green-500' :
                              payment.status === 'failed' ? 'bg-red-500' :
                              'bg-orange-500'
                            }`}></span>
                            {payment.status === 'succeeded' ? 'Succès' : payment.status === 'failed' ? 'Échoué' : 'En attente'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell py-4 px-6 text-sm text-slate-500 font-medium">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-2">receipt_long</span>
                        <p className="text-sm text-text-secondary">Aucune transaction récente</p>
                        <p className="text-xs text-text-secondary/60 mt-1">Vos paiements apparaîtront ici</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Withdrawals Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Retraits Récents</h3>
              <Link href="/withdrawals" className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Solde disponible</p>
                  <p className="text-2xl font-bold text-slate-900 leading-none">{soldeDisponible.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">HTG</span></p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Retrait minimum</p>
                  <p className="text-sm font-bold text-slate-900">50 <span className="text-[10px] text-slate-400">HTG</span></p>
                </div>
              </div>
              <div className="w-24 h-24 relative opacity-90 -mr-2">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                  <rect x="15" y="30" width="70" height="45" rx="8" fill="#F97316" fillOpacity="0.1"/>
                  <rect x="20" y="35" width="60" height="40" rx="6" fill="#FFF"/>
                  <path d="M70 45H80C82.2091 45 84 46.7909 84 49V59C84 61.2091 82.2091 63 80 63H70V45Z" fill="#F97316"/>
                  <circle cx="77" cy="54" r="3" fill="#FFF"/>
                  <circle cx="40" cy="55" r="10" fill="#F97316" fillOpacity="0.15"/>
                  <text x="40" y="59" fontSize="12" fontWeight="bold" fill="#F97316" textAnchor="middle">K</text>
                  <path d="M30 20C30 18.8954 30.8954 18 32 18H68C69.1046 18 70 18.8954 70 20V35H30V20Z" fill="#FB923C" fillOpacity="0.3"/>
                </svg>
              </div>
            </div>

            <Link href="/withdrawals" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              Demander un retrait
            </Link>
          </div>

          {/* Activité API Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Activité API <span className="text-xs text-slate-400 font-medium ml-1">(Aujourd'hui)</span></h3>
              <div className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Requêtes</p>
                <p className="text-xl font-bold text-slate-900">124</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Taux de succès</p>
                <p className="text-xl font-bold text-slate-900">98.6<span className="text-[10px] text-slate-400">%</span></p>
                <div className="mt-2 w-full h-4">
                  <svg viewBox="0 0 100 20" className="w-full h-full stroke-green-500" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M0 15 Q 15 5, 30 15 T 60 10 T 100 5"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Erreurs</p>
                <p className="text-xl font-bold text-slate-900">2</p>
                <div className="mt-2 w-full h-4">
                  <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-500" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M0 10 Q 15 15, 30 5 T 60 15 T 100 10"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Webhooks <span className="text-xs text-slate-400 font-medium ml-1">(Aujourd'hui)</span></h3>
              <div className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">webhook</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Événements</p>
                <p className="text-xl font-bold text-slate-900">32</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Livrés</p>
                <p className="text-xl font-bold text-green-600">30</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Échoués</p>
                <p className="text-xl font-bold text-red-500">2</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
