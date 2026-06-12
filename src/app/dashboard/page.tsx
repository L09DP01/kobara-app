import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import Link from "next/link";
import DashboardChartWrapper from "./analytics/DashboardChartWrapper";

export default async function DashboardPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  // Check Redis Cache
  const { safeRedis } = await import('@/lib/server/redis');
  const cacheKey = `dashboard:stats:${merchant.id}:${merchant.current_environment || 'test'}`;
  
  let stats: any = await safeRedis(async (redis) => {
    return await redis.get(cacheKey);
  }, null);

  if (!stats) {
    // Cache miss, compute stats from PostgreSQL
    
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
    
    // Calculate success rate
    const { count: totalCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('environment', merchant.current_environment || 'test');
    const { count: successCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('environment', merchant.current_environment || 'test').eq('status', 'succeeded');
    
    const successRate = totalCount ? ((successCount || 0) / totalCount) * 100 : 0;

    // Monthly revenue
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = succeededPayments?.filter(p => new Date(p.created_at) >= monthStart).reduce((sum, p) => sum + Number(p.net_amount || p.amount), 0) || 0;

    // Webhooks data
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: webhookEvents } = await supabase
      .from('webhook_events')
      .select('delivery_status')
      .eq('merchant_id', merchant.id)
      .gte('created_at', todayStart.toISOString());

    const webhooksTotal = webhookEvents?.length || 0;
    const webhooksSuccess = webhookEvents?.filter(w => w.delivery_status === 'success' || w.delivery_status === 'delivered').length || 0;
    const webhooksFailed = webhooksTotal - webhooksSuccess;

    // API Activity data (using audit_logs as proxy)
    const { data: apiLogs } = await supabase
      .from('audit_logs')
      .select('metadata')
      .eq('merchant_id', merchant.id)
      .gte('created_at', todayStart.toISOString());

    const apiTotal = apiLogs?.length || 0;
    const apiSuccess = apiLogs?.filter(log => !log.metadata?.error).length || 0;
    const apiErrors = apiTotal - apiSuccess;
    const apiSuccessRate = apiTotal > 0 ? ((apiSuccess / apiTotal) * 100).toFixed(1) : "0";

    stats = {
      recentPayments,
      recentWithdrawals,
      succeededPayments,
      totalEncaisse,
      successRate,
      monthlyRevenue,
      webhooksTotal,
      webhooksSuccess,
      webhooksFailed,
      apiTotal,
      apiSuccess,
      apiErrors,
      apiSuccessRate
    };

    // Save to cache for 5 minutes
    await safeRedis(async (redis) => {
      await redis.set(cacheKey, stats, { ex: 300 });
      return null;
    }, null);
  }

  // Solde disponible is always calculated from merchant real-time data to avoid cache stale
  const soldeDisponible = merchant.current_environment === 'test' 
    ? Number(merchant.available_balance_test || 0) 
    : Number(merchant.available_balance || 0);

  const {
    recentPayments,
    recentWithdrawals,
    succeededPayments,
    totalEncaisse,
    successRate,
    monthlyRevenue,
    webhooksTotal,
    webhooksSuccess,
    webhooksFailed,
    apiTotal,
    apiSuccess,
    apiErrors,
    apiSuccessRate
  } = stats;
  
  const now = new Date();

  return (
    <>
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            {merchant.business_name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Voici un aperçu de votre activité aujourd'hui.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
            {now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            <span className="material-symbols-outlined text-[18px] text-slate-500">expand_more</span>
          </button>
          <Link href="/payment-links" className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Créer un lien de paiement
          </Link>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Card 1 - Total Encaissé */}
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400 font-bold">Total Encaissé</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{totalEncaisse.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">HTG</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12.4%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* Card 2 - Solde Disponible */}
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400 font-bold">Solde Disponible</span>
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <span className="material-symbols-outlined text-[22px]">credit_card</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{soldeDisponible.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">HTG</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 8.7%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* Card 3 - Taux de Succès */}
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400 font-bold">Taux de Succès</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{successRate.toFixed(1)}<span className="text-sm font-medium text-slate-500">%</span></h3>
            <div className="w-full bg-white/10 rounded-full h-1 mt-3">
              <div className="bg-blue-500 h-1 rounded-full transition-all duration-500" style={{ width: `${successRate}%` }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 2.1%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">vs mois dernier</span>
          </div>
        </div>

        {/* Card 4 - Revenu Mensuel */}
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400 font-bold">Revenu Mensuel</span>
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <span className="material-symbols-outlined text-[22px]">monitoring</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{monthlyRevenue.toLocaleString('fr-FR')} <span className="text-sm font-medium text-slate-500">HTG</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-white/10 text-slate-400 px-2 py-0.5 rounded text-[11px] font-bold">
              0%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">vs mois dernier</span>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Chart Section */}
          <DashboardChartWrapper payments={succeededPayments || []} />

          {/* Recent Transactions Table */}
          <div className="bg-white/5 rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white tracking-tight">Transactions Récentes</h3>
              <Link href="/payments" className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                Voir Tout
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-3 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Client</th>
                    <th className="py-3 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Montant</th>
                    <th className="hidden sm:table-cell py-3 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Méthode</th>
                    <th className="py-3 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Statut</th>
                    <th className="hidden md:table-cell py-3 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentPayments && recentPayments.length > 0 ? (
                    recentPayments.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs border border-white/10">
                            {payment.customers?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm text-white font-bold truncate max-w-[140px]">
                            {payment.customers?.name || payment.kobara_reference}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-bold text-white">+{Number(payment.net_amount || payment.amount).toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-medium">{payment.currency}</span></div>
                        </td>
                        <td className="hidden sm:table-cell py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-500">smartphone</span>
                            <span className="text-sm text-slate-400 font-medium capitalize">{payment.provider}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                            payment.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                            'bg-orange-500/20 text-orange-400 border border-orange-500/20'
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
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">receipt_long</span>
                        <p className="text-sm text-slate-400">Aucune transaction récente</p>
                        <p className="text-xs text-slate-500 mt-1">Vos paiements apparaîtront ici</p>
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
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Retraits Récents</h3>
              <Link href="/withdrawals" className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solde disponible</p>
                  <p className="text-2xl font-bold text-white leading-none">{soldeDisponible.toLocaleString('fr-FR')} <span className="text-xs text-slate-500">HTG</span></p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Retrait minimum</p>
                  <p className="text-sm font-bold text-white">100 <span className="text-[10px] text-slate-500">HTG</span></p>
                </div>
              </div>
              <div className="w-24 h-24 relative opacity-90 -mr-2">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                  <rect x="15" y="30" width="70" height="45" rx="8" fill="#F97316" fillOpacity="0.1"/>
                  <rect x="20" y="35" width="60" height="40" rx="6" fill="#FFF" fillOpacity="0.1"/>
                  <path d="M70 45H80C82.2091 45 84 46.7909 84 49V59C84 61.2091 82.2091 63 80 63H70V45Z" fill="#F97316"/>
                  <circle cx="77" cy="54" r="3" fill="#FFF"/>
                  <circle cx="40" cy="55" r="10" fill="#F97316" fillOpacity="0.15"/>
                  <text x="40" y="59" fontSize="12" fontWeight="bold" fill="#F97316" textAnchor="middle">K</text>
                  <path d="M30 20C30 18.8954 30.8954 18 32 18H68C69.1046 18 70 18.8954 70 20V35H30V20Z" fill="#FB923C" fillOpacity="0.3"/>
                </svg>
              </div>
            </div>

            <Link href="/withdrawals" className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              Demander un retrait
            </Link>
          </div>

          {/* Activité API Widget */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Activité API <span className="text-xs text-slate-500 font-medium ml-1">(Aujourd'hui)</span></h3>
              <div className="text-slate-500">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requêtes</p>
                <p className="text-xl font-bold text-white">{apiTotal}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Taux de succès</p>
                <p className="text-xl font-bold text-white">{apiSuccessRate}<span className="text-[10px] text-slate-500">%</span></p>
                <div className="mt-2 w-full h-4">
                  <svg viewBox="0 0 100 20" className="w-full h-full stroke-green-500" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M0 15 Q 15 5, 30 15 T 60 10 T 100 5"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Erreurs</p>
                <p className="text-xl font-bold text-white">{apiErrors}</p>
                <div className="mt-2 w-full h-4">
                  <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-500" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M0 10 Q 15 15, 30 5 T 60 15 T 100 10"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks Widget */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Webhooks <span className="text-xs text-slate-500 font-medium ml-1">(Aujourd'hui)</span></h3>
              <div className="text-slate-500">
                <span className="material-symbols-outlined text-[18px]">webhook</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Événements</p>
                <p className="text-xl font-bold text-white">{webhooksTotal}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Livrés</p>
                <p className="text-xl font-bold text-green-400">{webhooksSuccess}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Échoués</p>
                <p className="text-xl font-bold text-red-400">{webhooksFailed}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
