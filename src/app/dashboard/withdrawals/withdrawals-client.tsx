'use client'

import { useState } from 'react';
import { requestWithdrawal } from './actions';
import { sendEmailOtpAction } from '../settings/actions';

export function WithdrawalsClient({ 
  withdrawals, 
  merchant,
  twoFactorMethod = 'none',
  userEmail = '',
  savedMoncashNumber = ''
}: { 
  withdrawals: any[], 
  merchant: any,
  twoFactorMethod?: 'none' | 'email' | 'totp',
  userEmail?: string,
  savedMoncashNumber?: string
}) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState('MonCash');
  const [receiver, setReceiver] = useState(savedMoncashNumber);
  const [saveNumber, setSaveNumber] = useState(false);
  const [code2fa, setCode2fa] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!amount || Number(amount) < 100) return;
    if (method === 'MonCash' && !receiver) {
      setErrorMsg("Le numéro de réception est requis pour MonCash.");
      return;
    }
    if (Number(amount) > Number(merchant.available_balance)) {
      setErrorMsg("Votre solde est insuffisant.");
      return;
    }

    try {
      setLoading(true);
      // For email OTP, trigger the email
      if (twoFactorMethod === 'email' || twoFactorMethod === 'none') {
        await sendEmailOtpAction();
      }
      setStep('otp');
    } catch (err: any) {
      setErrorMsg("Impossible d'envoyer le code de vérification.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!code2fa) {
      setErrorMsg("Veuillez saisir le code de sécurité.");
      return;
    }

    try {
      setLoading(true);
      const res = await requestWithdrawal(Number(amount), method, receiver, code2fa, undefined, saveNumber);
      
      if (res?.error) {
        throw new Error(res.error);
      }

      setIsModalOpen(false);
      setStep('details');
      setAmount('');
      setReceiver('');
      setCode2fa('');
      setSuccessMsg("Demande de retrait initiée !");
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep('details');
    setCode2fa('');
    setErrorMsg('');
  };

  const totalWithdrawn = withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.amount), 0);
  const filteredWithdrawals = filterStatus === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === filterStatus);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'completed': return { label: 'Complété', bg: 'bg-status-success/10', text: 'text-status-success', dot: 'bg-status-success', border: 'border-l-status-success' };
      case 'pending': return { label: 'En attente', bg: 'bg-status-warning/10', text: 'text-status-warning', dot: 'bg-status-warning', border: 'border-l-status-warning' };
      case 'processing': return { label: 'En traitement', bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', border: 'border-l-primary' };
      case 'failed': return { label: 'Échoué', bg: 'bg-status-error/10', text: 'text-status-error', dot: 'bg-status-error', border: 'border-l-status-error' };
      default: return { label: status, bg: 'bg-surface-container', text: 'text-text-secondary', dot: 'bg-text-secondary', border: 'border-l-border-subtle' };
    }
  };

  return (
    <div className="max-w-[1080px] w-full mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Retraits & Solde</h1>
          <p className="text-sm text-text-secondary mt-1">Gérez vos retraits et suivez votre solde en temps réel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/90 text-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          Initier un Retrait
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 text-status-success text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Balance Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        </div>
        <div className="relative z-10">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Solde Disponible</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {Number(merchant.available_balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg text-white/60">HTG</span>
          </h2>
          <div className="mt-6 flex gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-[#1a1a2e] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span>
              Retrait Rapide
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px] text-status-warning">hourglass_empty</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium">Solde en attente (Paiements)</p>
            <h3 className="text-xl font-bold text-text-primary">{Number(merchant.pending_balance || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal text-text-secondary">HTG</span></h3>
          </div>
        </div>
        <div className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px] text-status-success">trending_down</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium">Total Retiré</p>
            <h3 className="text-xl font-bold text-text-primary">{totalWithdrawn.toLocaleString('fr-FR')} <span className="text-sm font-normal text-text-secondary">HTG</span></h3>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-5">
              <h2 className="text-lg font-bold text-white">
                {step === 'details' ? 'Initier un Retrait' : 'Vérification de sécurité'}
              </h2>
              <p className="text-white/50 text-xs mt-1">
                {step === 'details' 
                  ? 'Les fonds seront envoyés sur votre compte MonCash' 
                  : 'Veuillez confirmer votre identité pour valider ce retrait'}
              </p>
            </div>
            
            <div className="p-6">
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              
              {step === 'details' ? (
                <form onSubmit={handleInitialSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-secondary font-medium mb-1.5">Montant (HTG) - Max: {merchant.available_balance}</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="1000.00"
                      max={Math.max(100, Number(merchant.available_balance || 0))}
                      min={100}
                      step="0.01"
                      className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-text-primary text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      required
                    />
                    {amount && Number(amount) >= 100 && (
                      <div className="mt-3 p-4 bg-surface-container rounded-xl border border-border-subtle space-y-2">
                        <div className="flex justify-between text-sm text-text-secondary">
                          <span>Montant demandé</span>
                          <span>{Number(amount).toLocaleString('fr-FR')} HTG</span>
                        </div>
                        <div className="flex justify-between text-sm text-status-warning">
                          <span>Frais appliqués (5%)</span>
                          <span>-{(Number(amount) * 0.05).toLocaleString('fr-FR')} HTG</span>
                        </div>
                        <div className="flex justify-between font-semibold text-text-primary mt-2 pt-2 border-t border-border-subtle">
                          <span>Montant net à recevoir</span>
                          <span className="text-status-success">{(Number(amount) * 0.95).toLocaleString('fr-FR')} HTG</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary font-medium mb-1.5">Méthode de réception</label>
                    <select 
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value="MonCash">MonCash</option>
                      <option value="Sogebank" disabled>Sogebank (Bientôt)</option>
                      <option value="Unibank" disabled>Unibank (Bientôt)</option>
                    </select>
                  </div>
                  
                  {method === 'MonCash' && (
                    <div>
                      <label className="block text-xs text-text-secondary font-medium mb-1.5">Numéro de téléphone (MonCash)</label>
                      <input 
                        type="tel" 
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="3xxxxxxx"
                        className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-3"
                        required
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={saveNumber}
                          onChange={(e) => setSaveNumber(e.target.checked)}
                          className="rounded border-border-subtle text-primary focus:ring-primary/30 bg-surface-container-low w-4 h-4"
                        />
                        <span className="text-sm text-text-secondary">Enregistrer ce numéro pour les prochains retraits</span>
                      </label>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-3">
                    <button 
                      type="button" 
                      onClick={closeModal}
                      className="px-5 py-2.5 text-text-secondary hover:bg-surface-container rounded-xl transition-colors text-sm font-medium"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm font-semibold shadow-sm"
                    >
                      {loading ? 'Traitement...' : 'Continuer'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="pt-2">
                    <label className="block text-xs text-text-secondary font-medium mb-1.5">
                      Code de sécurité ({(twoFactorMethod === 'totp') ? 'App Authenticator' : 'E-mail'})
                    </label>
                    <input 
                      type="text" 
                      value={code2fa}
                      onChange={(e) => setCode2fa(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-center tracking-widest font-mono font-bold text-2xl"
                      required
                    />
                    { (twoFactorMethod === 'email' || twoFactorMethod === 'none') && (
                       <p className="text-xs text-text-secondary mt-3 text-center">
                          Un code à 6 chiffres a été envoyé à <strong>{userEmail}</strong>.<br/>Veuillez le saisir ci-dessus pour valider la transaction.
                       </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep('details')}
                      className="px-5 py-2.5 text-text-secondary hover:bg-surface-container rounded-xl transition-colors text-sm font-medium"
                    >
                      Retour
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm font-semibold shadow-sm"
                    >
                      {loading ? 'Validation...' : 'Valider le retrait'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-primary">Historique des Retraits</h3>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-surface-container border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="failed">Échoués</option>
          </select>
        </div>
        <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-surface-container-lowest border-b border-border-subtle">
                <tr>
                  <th className="py-3.5 px-5 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">Date & Réf</th>
                  <th className="py-3.5 px-5 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">Méthode</th>
                  <th className="py-3.5 px-5 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">Montant</th>
                  <th className="py-3.5 px-5 font-semibold text-text-secondary uppercase tracking-wider text-[11px]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => {
                  const cfg = getStatusConfig(w.status);
                  return (
                    <tr key={w.id} className={`hover:bg-surface-container-lowest transition-colors group border-l-4 ${cfg.border}`}>
                      <td className="py-4 px-5">
                        <div className="font-mono text-xs text-text-primary truncate max-w-[160px]">{w.kobara_reference}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{new Date(w.created_at).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-text-secondary">smartphone</span>
                          <span className="font-medium text-text-primary text-sm">{w.method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-text-primary">-{Number(w.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-4xl text-text-secondary/30">account_balance_wallet</span>
                      </div>
                      <p className="text-sm text-text-secondary font-medium">Aucun retrait effectué</p>
                      <p className="text-xs text-text-secondary/60 mt-1">Commencez par effectuer votre premier retrait</p>
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
