'use client'

import { useState } from 'react';
import Link from 'next/link';
import { createCustomer } from './actions';

export function CustomersClient({ customers, stats }: { customers: any[], stats?: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const displayStats = stats || {
    totalClients: customers.length,
    activeClients: customers.filter(c => (c.payments?.length || 0) > 0).length,
    volumeMoyen: 0
  };

  const avatarColors = [
    'from-red-400 to-pink-500', 'from-blue-400 to-indigo-500', 'from-green-400 to-emerald-500',
    'from-purple-400 to-violet-500', 'from-orange-400 to-amber-500', 'from-teal-400 to-cyan-500',
  ];

  const getAvatarColor = (name: string) => {
    const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  };

  const getCustomerStats = (customer: any) => {
    const payments = customer.payments || [];
    
    // Only count succeeded/completed payments towards the volume
    const successfulPayments = payments.filter((p: any) => p.status === 'succeeded' || p.status === 'completed');
    
    const totalVolume = successfulPayments.reduce((acc: number, p: any) => acc + Number(p.net_amount || p.amount || 0), 0);
    
    let lastPaymentDate = null;
    let paymentMode = 'N/A';
    if (payments.length > 0) {
      const sorted = [...payments].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      lastPaymentDate = new Date(sorted[0].created_at);
      paymentMode = sorted[0].provider || 'MonCash';
    }

    return {
      paymentCount: payments.length,
      totalVolume,
      lastPaymentDate,
      paymentMode
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createCustomer({ name, email, phone });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-6 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients</h1>
          <p className="text-slate-400 text-sm mt-1">Gérez vos clients et visualisez leur historique de paiement.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Nouveau client
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/5 rounded-3xl border border-white/10 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-blue-400">group</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Clients</p>
            <p className="text-2xl font-bold text-white">{displayStats.totalClients}</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-green-400">trending_up</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Clients Actifs</p>
            <p className="text-2xl font-bold text-white">{displayStats.activeClients}</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-purple-400">payments</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Volume Moyen</p>
            <p className="text-2xl font-bold text-white">
              {Math.round(displayStats.volumeMoyen).toLocaleString('fr-FR')} HTG
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white/5 rounded-3xl border border-white/10 shadow-sm overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm" 
              placeholder="Rechercher par nom, email ou téléphone..." 
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/10 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-slate-400">download</span>
            Exporter CSV
          </button>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-transparent">
                <th className="py-3.5 px-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Client</th>
                <th className="py-3.5 px-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Téléphone</th>
                <th className="py-3.5 px-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Mode de paiement</th>
                <th className="py-3.5 px-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Volume Total</th>
                <th className="py-3.5 px-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Dernier paiement</th>
                <th className="py-3.5 px-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-white divide-y divide-white/10">
              {customers.length > 0 ? customers.map((customer) => {
                const stats = getCustomerStats(customer);
                return (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors group cursor-pointer border-l-[3px] border-l-transparent hover:border-l-orange-500">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {(customer.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{customer.name || 'Client Inconnu'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-400 text-sm">{customer.phone || 'Aucun'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        {stats.paymentMode !== 'N/A' && <span className="material-symbols-outlined text-[14px] text-slate-500">smartphone</span>}
                        <span className="font-bold capitalize">{stats.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold">{stats.totalVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-sm">
                      {stats.lastPaymentDate ? stats.lastPaymentDate.toLocaleDateString('fr-FR') : 'Aucun'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link 
                        href={`/customers/${customer.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        Détails
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-4xl text-slate-500/30">groups</span>
                    </div>
                    <p className="text-sm text-slate-400 font-bold">Aucun client trouvé</p>
                    <p className="text-xs text-slate-500 mt-1">Vos clients apparaîtront ici après leur premier paiement ou ajout manuel</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold">Affichage de {customers.length} client(s)</p>
          <div className="flex gap-1.5">
            <button className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/10 disabled:opacity-40" disabled>Précédent</button>
            <button className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40" disabled>Suivant</button>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#131B2C] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nouveau Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-white mb-1">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-white"
                  placeholder="Jean Exemple"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Téléphone</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-white"
                  placeholder="+509 XXXX XXXX"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl font-bold text-sm text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                  Ajouter le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
