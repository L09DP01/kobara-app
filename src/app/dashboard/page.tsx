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
      {/* Welcome Banner */}
      <section className="relative rounded-3xl bg-slate-950 p-8 mb-6 overflow-hidden border border-slate-900 shadow-md">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{greeting}, {merchant.business_name}</h1>
          <p className="text-slate-400 text-sm font-medium flex items-center gap-4">
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {succeededPayments && succeededPayments.length > 0 && (
              <span className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-slate-300 text-xs shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                {succeededPayments.length} paiement(s) réussi(s)
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Card 1 - Total Encaissé */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-medium">Total Encaissé</span>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{totalEncaisse.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">HTG</span></h3>
          </div>
        </div>

        {/* Card 2 - Solde Disponible */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-medium">Solde Disponible</span>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined text-[20px]">wallet</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{soldeDisponible.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">HTG</span></h3>
          </div>
        </div>

        {/* Card 3 - Taux de Succès */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-medium">Taux de Succès</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{successRate.toFixed(1)}<span className="text-sm font-medium text-slate-500">%</span></h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${successRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4 - Revenu Mensuel */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-medium">Revenu Mensuel</span>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{monthlyRevenue.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">HTG</span></h3>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Chart Section */}
          <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
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
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
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
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Retraits Récents</h3>
              <Link href="/withdrawals" className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentWithdrawals && recentWithdrawals.length > 0 ? (
                recentWithdrawals.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        w.status === 'completed' ? 'bg-green-50 text-green-600' :
                        w.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 font-semibold">{w.wallet}</p>
                        <p className="text-xs text-slate-500 font-medium">{new Date(w.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">-{Number(w.amount).toLocaleString('fr-FR')} <span className="text-[10px] text-slate-500 font-medium">HTG</span></p>
                      <span className={`inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        w.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        w.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {w.status === 'completed' ? 'Traité' : w.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-400">account_balance_wallet</span>
                  </div>
                  <p className="text-sm text-slate-600 font-bold">Aucun retrait</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Effectuez votre premier retrait</p>
                </div>
              )}
            </div>
            <Link href="/withdrawals" className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              Demander un retrait
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
