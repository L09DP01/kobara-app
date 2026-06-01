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
      <section className="relative rounded-2xl bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 mb-2 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-secondary rounded-full blur-[80px] -mb-32"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1">{greeting}, {merchant.business_name} 👋</h1>
          <p className="text-white/60 text-sm">
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {succeededPayments && succeededPayments.length > 0 && (
              <span className="ml-3 inline-flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full text-white/80 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                {succeededPayments.length} paiement(s) réussi(s)
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {/* Card 1 - Total Encaissé */}
        <div className="bg-surface-card rounded-xl border border-border-subtle p-5 flex flex-col gap-3 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border-l-4 border-l-status-success">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary font-medium">Total Encaissé</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-status-success">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">{totalEncaisse.toLocaleString('fr-FR')} <span className="text-sm font-normal text-text-secondary">HTG</span></h3>
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-10" viewBox="0 0 200 30"><path d="M0,25 Q30,10 60,18 T120,12 T180,20 T200,8" fill="none" stroke="#22c55e" strokeWidth="2"/></svg>
        </div>

        {/* Card 2 - Solde Disponible */}
        <div className="bg-surface-card rounded-xl border border-border-subtle p-5 flex flex-col gap-3 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary font-medium">Solde Disponible</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">wallet</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">{soldeDisponible.toLocaleString('fr-FR')} <span className="text-sm font-normal text-text-secondary">HTG</span></h3>
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-10" viewBox="0 0 200 30"><path d="M0,20 Q40,8 80,22 T160,10 T200,18" fill="none" stroke="#ef4444" strokeWidth="2"/></svg>
        </div>

        {/* Card 3 - Taux de Succès */}
        <div className="hidden md:flex bg-surface-card rounded-xl border border-border-subtle p-5 flex-col gap-3 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary font-medium">Taux de Succès</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">{successRate.toFixed(1)}<span className="text-sm font-normal text-text-secondary">%</span></h3>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${successRate}%` }}></div>
          </div>
        </div>

        {/* Card 4 - Revenu Mensuel */}
        <div className="hidden md:flex bg-surface-card rounded-xl border border-border-subtle p-5 flex-col gap-3 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary font-medium">Revenu Mensuel</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">{monthlyRevenue.toLocaleString('fr-FR')} <span className="text-sm font-normal text-text-secondary">HTG</span></h3>
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-10" viewBox="0 0 200 30"><path d="M0,22 Q50,5 100,20 T200,10" fill="none" stroke="#f97316" strokeWidth="2"/></svg>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Chart Section */}
          <div className="hidden md:block bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text-primary">Flux Financier</h3>
              <div className="flex items-center bg-surface-container-lowest border border-border-subtle rounded-lg p-0.5">
                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-text-secondary hover:text-text-primary transition-colors">7j</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-on-primary shadow-sm">30j</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-text-secondary hover:text-text-primary transition-colors">90j</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <RevenueChart data={chartData} />
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">Transactions Récentes</h3>
              <Link href="/payments" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Voir Tout
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-container-lowest/50">
                    <th className="py-2.5 sm:py-3 px-3 sm:px-5 text-[10px] sm:text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Client</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-5 text-[10px] sm:text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Montant</th>
                    <th className="hidden sm:table-cell py-3 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Méthode</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-5 text-[10px] sm:text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Statut</th>
                    <th className="hidden md:table-cell py-3 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {recentPayments && recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="py-2.5 sm:py-3.5 px-3 sm:px-5 flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-[10px] sm:text-xs border border-primary/10">
                            {payment.customers?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-xs sm:text-sm text-text-primary font-medium truncate max-w-[100px] sm:max-w-[140px]">
                            {payment.customers?.name || payment.kobara_reference}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3.5 px-3 sm:px-5">
                          <div className="text-xs sm:text-sm font-semibold text-status-success">+{Number(payment.net_amount || payment.amount).toLocaleString('fr-FR')} <span className="text-[10px] sm:text-xs">{payment.currency}</span></div>
                        </td>
                        <td className="hidden sm:table-cell py-3.5 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-text-secondary">smartphone</span>
                            <span className="text-xs text-text-secondary capitalize">{payment.provider}</span>
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-3.5 px-3 sm:px-5">
                          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold ${
                            payment.status === 'succeeded' ? 'bg-status-success/10 text-status-success' :
                            payment.status === 'failed' ? 'bg-status-error/10 text-status-error' :
                            'bg-status-warning/10 text-status-warning'
                          }`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                              payment.status === 'succeeded' ? 'bg-status-success' :
                              payment.status === 'failed' ? 'bg-status-error' :
                              'bg-status-warning'
                            }`}></span>
                            {payment.status === 'succeeded' ? 'Succès' : payment.status === 'failed' ? 'Échoué' : 'En attente'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell py-3.5 px-5 text-xs text-text-secondary">
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
          <div className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-text-primary">Retraits Récents</h3>
              <Link href="/withdrawals" className="p-1.5 hover:bg-surface-container rounded-lg text-text-secondary transition-colors">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentWithdrawals && recentWithdrawals.length > 0 ? (
                recentWithdrawals.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-3 hover:bg-surface-container-lowest rounded-xl transition-colors border border-transparent hover:border-border-subtle group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        w.status === 'completed' ? 'bg-green-50 text-status-success' :
                        w.status === 'pending' ? 'bg-amber-50 text-status-warning' :
                        'bg-red-50 text-status-error'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">{w.wallet}</p>
                        <p className="text-[11px] text-text-secondary">{new Date(w.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">-{Number(w.amount).toLocaleString('fr-FR')} HTG</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        w.status === 'completed' ? 'bg-status-success/10 text-status-success' :
                        w.status === 'pending' ? 'bg-status-warning/10 text-status-warning' :
                        'bg-status-error/10 text-status-error'
                      }`}>
                        {w.status === 'completed' ? 'Traité' : w.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/40">account_balance_wallet</span>
                  </div>
                  <p className="text-sm text-text-secondary font-medium">Aucun retrait</p>
                  <p className="text-xs text-text-secondary/60 mt-0.5">Effectuez votre premier retrait</p>
                </div>
              )}
            </div>
            <Link href="/withdrawals" className="flex items-center justify-center gap-2 w-full mt-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-on-primary rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              Demander un retrait
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
