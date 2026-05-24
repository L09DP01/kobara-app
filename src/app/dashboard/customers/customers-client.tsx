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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Clients</h1>
          <p className="text-text-secondary text-sm mt-1">Gérez vos clients et visualisez leur historique de paiement.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Nouveau client
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card rounded-xl border border-border-subtle p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-blue-600">group</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium">Total Clients</p>
            <p className="text-lg font-bold text-text-primary">{displayStats.totalClients}</p>
          </div>
        </div>
        <div className="bg-surface-card rounded-xl border border-border-subtle p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-status-success">trending_up</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium">Clients Actifs</p>
            <p className="text-lg font-bold text-text-primary">{displayStats.activeClients}</p>
          </div>
        </div>
        <div className="bg-surface-card rounded-xl border border-border-subtle p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-purple-600">payments</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium">Volume Moyen</p>
            <p className="text-lg font-bold text-text-primary">
              {Math.round(displayStats.volumeMoyen).toLocaleString('fr-FR')} HTG
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 text-[20px]">search</span>
            <input 
              className="w-full pl-11 pr-4 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
              placeholder="Rechercher par nom, email ou téléphone..." 
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-sm font-medium text-text-primary hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-status-success">download</span>
            Exporter CSV
          </button>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest/50">
                <th className="py-3.5 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Client</th>
                <th className="py-3.5 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Téléphone</th>
                <th className="py-3.5 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Mode de paiement</th>
                <th className="py-3.5 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Volume Total</th>
                <th className="py-3.5 px-5 text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Dernier paiement</th>
                <th className="py-3.5 px-5 text-right text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-text-primary divide-y divide-border-subtle">
              {customers.length > 0 ? customers.map((customer) => {
                const stats = getCustomerStats(customer);
                return (
                  <tr key={customer.id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                          {(customer.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">{customer.name || 'Client Inconnu'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-text-secondary text-sm">{customer.phone || 'Aucun'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        {stats.paymentMode !== 'N/A' && <span className="material-symbols-outlined text-[14px] text-text-secondary">smartphone</span>}
                        <span className="font-semibold capitalize">{stats.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold">{stats.totalVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</div>
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary text-sm">
                      {stats.lastPaymentDate ? stats.lastPaymentDate.toLocaleDateString('fr-FR') : 'Aucun'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link 
                        href={`/dashboard/customers/${customer.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
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
                    <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-4xl text-text-secondary/30">groups</span>
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Aucun client trouvé</p>
                    <p className="text-xs text-text-secondary/60 mt-1">Vos clients apparaîtront ici après leur premier paiement ou ajout manuel</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between">
          <p className="text-xs text-text-secondary font-medium">Affichage de {customers.length} client(s)</p>
          <div className="flex gap-1.5">
            <button className="px-3 py-1.5 border border-border-subtle rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-container disabled:opacity-40" disabled>Précédent</button>
            <button className="px-3 py-1.5 border border-border-subtle rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-container disabled:opacity-40" disabled>Suivant</button>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-subtle animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Nouveau Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-status-error text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-text-primary"
                  placeholder="Jean Exemple"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Téléphone</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-text-primary"
                  placeholder="+509 XXXX XXXX"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border-subtle rounded-xl font-semibold text-sm text-text-secondary hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
