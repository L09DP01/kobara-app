'use client'

import { useState } from 'react';
import { requestWithdrawal } from './actions';

export function WithdrawalsClient({ 
  withdrawals, 
  merchant 
}: { 
  withdrawals: any[], 
  merchant: any 
}) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState('MonCash');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) return;
    
    try {
      setLoading(true);
      await requestWithdrawal(Number(amount), method);
      setIsModalOpen(false);
      setAmount('');
      alert("Demande de retrait initiée !");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-status-success/10 text-status-success">Complété</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-status-warning/10 text-status-warning">En attente</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">En traitement</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-status-error/10 text-status-error">Échoué</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1080px] w-full mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Retraits & Solde</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-body-base text-body-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          Initier un Retrait
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-headline-md font-headline-md text-text-primary mb-4">Initier un Retrait</h2>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-1">Montant (HTG) - Max: {merchant.available_balance}</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="1000.00"
                  max={merchant.available_balance}
                  min={100}
                  step="0.01"
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-1">Méthode de réception</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="MonCash">MonCash</option>
                  <option value="Sogebank">Sogebank (Bientôt)</option>
                  <option value="Unibank">Unibank (Bientôt)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-surface-container rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Traitement...' : 'Retirer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Balance Overview Top Row (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-surface-card rounded-xl border border-border-subtle p-8 ambient-shadow relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="font-body-base text-body-sm text-text-secondary font-medium uppercase tracking-wider mb-2">Solde Disponible</p>
              <h2 className="font-display-xl text-display-xl text-text-primary">HTG {Number(merchant.available_balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setIsModalOpen(true)} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-body-base text-body-sm font-medium hover:opacity-90 transition-opacity">
                Retrait Rapide
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-background-main rounded-full opacity-50 pointer-events-none"></div>
        </div>

        {/* Secondary Balances Stacking */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow flex-1">
            <div className="flex justify-between items-start mb-2">
              <p className="font-body-base text-body-sm text-text-secondary font-medium">Solde en attente</p>
              <div className="w-8 h-8 rounded-full bg-status-warning/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-status-warning">hourglass_empty</span>
              </div>
            </div>
            <h3 className="font-headline-lg text-headline-md text-text-primary">HTG {Number(merchant.pending_balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-md text-headline-md text-text-primary">Historique des Retraits</h3>
        </div>
        <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden ambient-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-base text-body-sm min-w-[600px]">
              <thead className="bg-surface-container-low border-b border-border-subtle">
                <tr>
                  <th className="py-4 px-6 font-medium text-text-secondary uppercase tracking-wider text-[11px]">Date & Réf</th>
                  <th className="py-4 px-6 font-medium text-text-secondary uppercase tracking-wider text-[11px]">Méthode</th>
                  <th className="py-4 px-6 font-medium text-text-secondary uppercase tracking-wider text-[11px]">Montant</th>
                  <th className="py-4 px-6 font-medium text-text-secondary uppercase tracking-wider text-[11px]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {withdrawals.length > 0 ? withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="py-4 px-6">
                      <div className="text-text-secondary text-[12px]">{new Date(w.created_at).toLocaleDateString('fr-FR')}</div>
                      <div className="font-mono-code text-mono-code text-text-primary mt-1">{w.reference}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-text-primary">{w.method}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-text-primary">HTG {Number(w.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(w.status)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-secondary">
                      Aucun retrait effectué pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
