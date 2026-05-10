import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RevenueChart from "./RevenueChart";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtenir le merchant_id actuel
  let merchantId = null;

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchant) {
    merchantId = merchant.id;
  } else {
    const { data: member } = await supabase
      .from('merchant_members')
      .select('merchant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (member) {
      merchantId = member.merchant_id;
    }
  }

  if (!merchantId) {
    redirect('/login');
  }

  // Get payments for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, created_at, customer_id')
    .eq('merchant_id', merchantId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  let totalGross = 0;
  let successCount = 0;
  let uniqueCustomers = new Set();
  
  // Prepare chart data (Group by day)
  const chartDataMap: Record<string, number> = {};
  
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    chartDataMap[dateStr] = 0;
  }

  if (payments) {
    payments.forEach(p => {
      // stats
      if (p.status === 'succeeded') {
        totalGross += Number(p.amount);
        successCount++;
        
        if (p.customer_id) {
          uniqueCustomers.add(p.customer_id);
        }

        // group by day for chart
        const pDate = new Date(p.created_at);
        const dateStr = pDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        if (chartDataMap[dateStr] !== undefined) {
          chartDataMap[dateStr] += Number(p.amount);
        }
      }
    });
  }

  const chartData = Object.keys(chartDataMap).map(date => ({
    date,
    revenue: chartDataMap[date]
  }));

  const conversionRate = payments && payments.length > 0 
    ? ((successCount / payments.length) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Analyses</h1>
          <p className="text-text-secondary text-body-sm mt-1">Suivez les performances de vos ventes et l'évolution de vos revenus.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-surface-card border border-border-subtle text-text-primary px-4 py-2 rounded-lg font-body-sm focus:ring-primary focus:border-primary">
            <option>30 derniers jours</option>
          </select>
          <button className="bg-surface-card border border-border-subtle text-text-primary px-4 py-2 rounded-lg font-body-sm hover:bg-surface-container transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Rapport
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between ambient-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Revenus bruts</p>
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-status-success">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-md text-text-primary">{totalGross.toLocaleString('fr-FR')} HTG</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-text-secondary font-body-sm">
            <span>Sur les 30 derniers jours</span>
          </div>
        </div>

        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between ambient-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Paiements réussis</p>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-md text-text-primary">{successCount}</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-text-secondary font-body-sm">
            <span>Sur les 30 derniers jours</span>
          </div>
        </div>

        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between ambient-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Taux de conversion</p>
            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[18px]">query_stats</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-md text-text-primary">{conversionRate}%</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-text-secondary font-body-sm">
            <span>Sur les 30 derniers jours</span>
          </div>
        </div>

        <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between ambient-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-text-secondary">Clients uniques</p>
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-headline-lg text-headline-md text-text-primary">{uniqueCustomers.size}</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-text-secondary font-body-sm">
            <span>Sur les 30 derniers jours</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow h-[400px] flex flex-col">
        <h3 className="text-headline-md font-headline-md text-text-primary mb-6">évolution des revenus</h3>
        <div className="flex-1">
          <RevenueChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
