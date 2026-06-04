"use client";

import { useState } from "react";
import RevenueChart from "./RevenueChart";

export default function DashboardChartWrapper({ payments }: { payments: any[] }) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  // Group by date based on period
  const chartDataMap = new Map();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  for (let i = 0; i <= period; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (period - i));
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    chartDataMap.set(dateStr, 0);
  }

  if (payments) {
    payments.forEach(p => {
      if (!p.created_at) return;
      const d = new Date(p.created_at);
      if (d >= startDate) {
        const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        if (chartDataMap.has(dateStr)) {
          chartDataMap.set(dateStr, chartDataMap.get(dateStr) + Number(p.net_amount || p.amount));
        }
      }
    });
  }

  const chartData = Array.from(chartDataMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  return (
    <div className="hidden md:block bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">Flux Financier</h3>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
          <button onClick={() => setPeriod(7)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${period === 7 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>7j</button>
          <button onClick={() => setPeriod(30)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${period === 30 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>30j</button>
          <button onClick={() => setPeriod(90)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${period === 90 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>90j</button>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}
