'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function PaymentsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const status = searchParams.get('status') || 'all';

  const updateFilters = (newQ: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newQ) params.set('q', newQ);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    router.push(`/dashboard/payments?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== (searchParams.get('q') || '')) {
         updateFilters(q, status);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [q, status]);

  return (
    <div className="space-y-5">
      {/* ── Search, Filters & Actions ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        {/* Search */}
        <div className="relative w-full lg:w-[480px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
          <input
            className="w-full pl-11 pr-4 py-3 bg-surface-card border border-border-subtle rounded-xl text-body-sm font-body-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-all duration-200"
            placeholder="Rechercher par ID, client ou montant..."
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">

          <Link href="/dashboard/payment-links" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-body-sm font-semibold hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add_link</span>
            Créer un lien de paiement
          </Link>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => updateFilters(q, 'all')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 ${
            status === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-card text-text-secondary border border-border-subtle hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">list</span>
          Tous
        </button>
        <button 
          onClick={() => updateFilters(q, 'succeeded')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5 ${
            status === 'succeeded' ? 'bg-status-success/20 text-status-success border-status-success/40' : 'bg-status-success/5 text-status-success/70 border-status-success/10 hover:bg-status-success/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
          Succès
        </button>
        <button 
          onClick={() => updateFilters(q, 'pending')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5 ${
            status === 'pending' ? 'bg-status-warning/20 text-status-warning border-status-warning/40' : 'bg-status-warning/5 text-status-warning/70 border-status-warning/10 hover:bg-status-warning/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span>
          En attente
        </button>
        <button 
          onClick={() => updateFilters(q, 'failed')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5 ${
            status === 'failed' ? 'bg-status-error/20 text-status-error border-status-error/40' : 'bg-status-error/5 text-status-error/70 border-status-error/10 hover:bg-status-error/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-status-error"></span>
          Échoué
        </button>
      </div>
    </div>
  );
}
