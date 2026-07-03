'use client'

import { useState } from 'react';
import { requestWithdrawal } from './actions';
import { executeB2BTransfer } from './b2b-actions';
import { sendEmailOtpAction } from '../settings/actions';
import { useEnvironment } from '@/context/EnvironmentContext';
import { QRCodeSVG } from 'qrcode.react';

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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState('MonCash');
  const [receiver, setReceiver] = useState(savedMoncashNumber);
  const [saveNumber, setSaveNumber] = useState(false);
  const [code2fa, setCode2fa] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { currentEnvironment } = useEnvironment();

  const isTest = currentEnvironment === 'test';
  const activeBalance = isTest
    ? Number(merchant.available_balance_test || 0)
    : Number(merchant.available_balance || 0);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    let minAmount = 150;
    if (method === 'B2B') minAmount = 1;
    if (method === 'Zelle') minAmount = 2840;

    if (!amount || Number(amount) < minAmount) {
      setErrorMsg(method === 'Zelle' ? `Le montant minimum pour Zelle est de 2840 HTG (20 $).` : `Le montant minimum est de ${minAmount} HTG`);
      return;
    }
    if (method === 'B2B' && !receiver) {
      setErrorMsg("L'email du destinataire est requis pour le transfert B2B.");
      return;
    }
    if ((method === 'MonCash' || method === 'NatCash') && !receiver) {
      setErrorMsg(`Le numéro de réception est requis pour ${method}.`);
      return;
    }
    if (method === 'Zelle' && !receiver) {
      setErrorMsg("L'email ou le téléphone est requis pour Zelle.");
      return;
    }
    if (Number(amount) > activeBalance) {
      setErrorMsg("Votre solde est insuffisant.");
      return;
    }

    try {
      setLoading(true);
      // Skip OTP for test environment
      if (isTest) {
        let res;
        if (method === 'B2B') {
          res = await executeB2BTransfer(Number(amount), receiver, undefined);
        } else {
          res = await requestWithdrawal(Number(amount), method, receiver, undefined, undefined, saveNumber);
        }

        if (res?.error) throw new Error(res.error);

        setIsModalOpen(false);
        setStep('details');
        setAmount('');
        setReceiver('');
        setCode2fa('');
        setSuccessMsg("Simulation de retrait réussie !");
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        // For email OTP, trigger the email
        if (twoFactorMethod === 'email' || twoFactorMethod === 'none') {
          await sendEmailOtpAction();
        }
        setStep('otp');
      }
    } catch (err: any) {
      setErrorMsg("Impossible d'envoyer le code de vérification.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code2fa && !isTest) {
      setErrorMsg("Veuillez saisir le code de sécurité.");
      return;
    }

    try {
      setLoading(true);
      let res;
      if (method === 'B2B') {
        res = await executeB2BTransfer(Number(amount), receiver, code2fa);
      } else {
        res = await requestWithdrawal(Number(amount), method, receiver, code2fa, undefined, saveNumber);
      }

      if (res?.error) {
        throw new Error(res.error);
      }

      setIsModalOpen(false);
      setStep('details');
      setAmount('');
      setReceiver('');
      setCode2fa('');

      const successMessage = (res as any)?.status === 'completed'
        ? "Votre retrait a été effectué avec succès."
        : "Demande de retrait initiée et en cours de traitement.";

      setSuccessMsg(successMessage);
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
    switch (status) {
      case 'completed': return { label: 'Complété', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500', border: 'border-l-green-500' };
      case 'pending': return { label: 'En attente', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500', border: 'border-l-amber-500' };
      case 'processing': return { label: 'En traitement', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500', border: 'border-l-blue-500' };
      case 'failed': return { label: 'Échoué', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500', border: 'border-l-red-500' };
      default: return { label: status, bg: 'bg-white/5', text: 'text-slate-400', dot: 'bg-slate-500', border: 'border-l-white/10' };
    }
  };

  return (
    <div className="max-w-[1080px] w-full mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Retraits & Solde</h1>
          <p className="text-sm text-slate-400 mt-1">Gérez vos retraits et suivez votre solde en temps réel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors shadow-sm flex items-center gap-2 border border-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code</span>
            Mon QR Code
          </button>
          <button
            onClick={() => { setMethod('MonCash'); setIsModalOpen(true); }}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            Initier un Retrait
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/20 text-status-success text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Balance Banner */}
      <div className="relative rounded-3xl bg-[#0F1626] p-8 overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        </div>
        <div className="relative z-10">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Solde Disponible</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {activeBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-lg text-white/60">HTG</span>
          </h2>
          <div className="mt-6 flex gap-4">
            <button onClick={() => { setMethod('MonCash'); setIsModalOpen(true); }} className="bg-white text-[#1a1a2e] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span>
              Retrait
            </button>
            <button onClick={() => { setMethod('B2B'); setIsModalOpen(true); }} className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-500/30 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
              Transfert B2B
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/5 rounded-3xl border border-white/10 p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-orange-400">hourglass_empty</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Solde en attente (Paiements)</p>
            <h3 className="text-xl font-bold text-white">{Number(merchant.pending_balance || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">HTG</span></h3>
          </div>
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 p-5 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-green-400">trending_down</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Retiré</p>
            <h3 className="text-xl font-bold text-white">{totalWithdrawn.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">HTG</span></h3>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#131B2C] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
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
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {step === 'details' ? (
                <form onSubmit={handleInitialSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Montant (HTG) - Max: {activeBalance}</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="1000.00"
                      max={Math.max(100, activeBalance)}
                      min={100}
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                    {amount && Number(amount) > 0 && method !== 'B2B' && (
                      <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Montant demandé</span>
                          <span>{Number(amount).toLocaleString('fr-FR')} HTG</span>
                        </div>
                        {method === 'Zelle' ? (
                          <div className="flex justify-between text-sm text-blue-400">
                            <span>Montant en USD (taux: 142 HTG/$)</span>
                            <span>${(Number(amount) / 142).toFixed(2)} USD</span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-sm text-orange-400">
                            <span>Frais appliqués (5%)</span>
                            <span>-{(Number(amount) * 0.05).toLocaleString('fr-FR')} HTG</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-white mt-2 pt-2 border-t border-white/10">
                          <span>Montant net à recevoir</span>
                          {method === 'Zelle' ? (
                            <span className="text-green-400">${(Number(amount) / 142).toFixed(2)} USD</span>
                          ) : (
                            <span className="text-green-400">{(Number(amount) * 0.95).toLocaleString('fr-FR')} HTG</span>
                          )}
                        </div>
                      </div>
                    )}
                    {amount && Number(amount) > 0 && method === 'B2B' && (
                      <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Montant envoyé</span>
                          <span>{Number(amount).toLocaleString('fr-FR')} HTG</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-400">
                          <span>Frais B2B appliqués (0%)</span>
                          <span>Gratuit</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Méthode de réception</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all [&>option]:bg-[#131B2C]"
                    >
                      <option value="MonCash">MonCash</option>
                      <option value="NatCash">NatCash</option>
                      <option value="Zelle">Zelle (min 20$ / 3125 HTG)</option>
                      <option value="B2B">Transfert B2B (Gratuit)</option>
                      <option value="Sogebank" disabled>Sogebank (Bientôt)</option>
                      <option value="Unibank" disabled>Unibank (Bientôt)</option>
                    </select>
                  </div>

                  {method === 'B2B' && (
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5">Email du marchand destinataire</label>
                      <input
                        type="email"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="marchand@exemple.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mb-3"
                        required
                      />
                    </div>
                  )}

                  {method === 'Zelle' && (
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5">Email ou Téléphone (Zelle)</label>
                      <input
                        type="text"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="email@exemple.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mb-3"
                        required
                      />
                    </div>
                  )}

                  {(method === 'MonCash' || method === 'NatCash') && (
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5">Numéro de téléphone ({method})</label>
                      <input
                        type="tel"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="3xxxxxxx"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mb-3"
                        required
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveNumber}
                          onChange={(e) => setSaveNumber(e.target.checked)}
                          className="rounded border-white/10 text-orange-500 focus:ring-orange-500/30 bg-white/5 w-4 h-4"
                        />
                        <span className="text-sm text-slate-400">Enregistrer ce numéro pour les prochains retraits</span>
                      </label>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-colors text-sm font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all text-sm font-bold shadow-sm"
                    >
                      {loading ? 'Traitement...' : 'Continuer'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div className="pt-2">
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">
                      Code de sécurité ({(twoFactorMethod === 'totp') ? 'App Authenticator' : 'E-mail'})
                    </label>
                    <input
                      type="text"
                      value={code2fa}
                      onChange={(e) => setCode2fa(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-center tracking-widest font-mono font-bold text-2xl"
                      required
                    />
                    {(twoFactorMethod === 'email' || twoFactorMethod === 'none') && (
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Un code à 6 chiffres a été envoyé à <strong>{userEmail}</strong>.<br />Veuillez le saisir ci-dessus pour valider la transaction.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="px-5 py-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-colors text-sm font-bold"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all text-sm font-bold shadow-sm"
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
          <h3 className="text-lg font-bold text-white">Historique des Retraits</h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all shadow-sm [&>option]:bg-[#131B2C]"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="failed">Échoués</option>
          </select>
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-transparent border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Date & Réf</th>
                  <th className="py-3.5 px-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Méthode</th>
                  <th className="py-3.5 px-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Montant</th>
                  <th className="py-3.5 px-5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => {
                  const cfg = getStatusConfig(w.status);
                  return (
                    <tr
                      key={w.id}
                      onClick={() => setSelectedWithdrawal(w)}
                      className={`hover:bg-white/5 transition-colors group border-l-4 cursor-pointer ${cfg.border}`}
                    >
                      <td className="py-4 px-5">
                        <div className="font-mono text-xs text-white truncate max-w-[160px] font-bold">{w.kobara_reference}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{new Date(w.created_at).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">smartphone</span>
                          <span className="font-bold text-white text-sm">{w.method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-white">-{Number(w.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-4xl text-slate-500/30">account_balance_wallet</span>
                      </div>
                      <p className="text-sm text-slate-400 font-bold">Aucun retrait effectué</p>
                      <p className="text-xs text-slate-500 mt-1">Commencez par effectuer votre premier retrait</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#131B2C] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Votre QR Code B2B</h2>
            <p className="text-slate-400 text-sm mb-6">
              Faites scanner ce code par un autre marchand dans l'application mobile pour recevoir un transfert instantané.
            </p>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-6">
              <QRCodeSVG
                value={`kobara://transfer?email=${userEmail}`}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
            </div>
            <div className="text-sm text-slate-300 font-medium bg-white/5 p-3 rounded-xl border border-white/10 mb-6 break-all">
              {userEmail}
            </div>
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full bg-white/10 text-white px-4 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Detail Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#131B2C] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Détails du retrait</h2>
                <p className="text-white/50 text-sm mt-1">{selectedWithdrawal.kobara_reference}</p>
              </div>
              <button onClick={() => setSelectedWithdrawal(null)} className="p-2 -mr-2 -mt-2 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-sm text-slate-400">Montant brut (déduit)</span>
                <span className="font-bold text-white">{Number(selectedWithdrawal.total || selectedWithdrawal.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-sm text-slate-400">Frais appliqués</span>
                <span className="font-bold text-orange-400">-{Number(selectedWithdrawal.fees || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-sm font-bold text-white">Montant net (reçu)</span>
                <span className="text-xl font-bold text-green-400">{Number(selectedWithdrawal.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} HTG</span>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Méthode</span>
                  <span className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-orange-500">smartphone</span>
                    {selectedWithdrawal.provider || selectedWithdrawal.method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Destinataire</span>
                  <span className="text-sm font-bold text-white">{selectedWithdrawal.wallet || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Date</span>
                  <span className="text-sm font-bold text-white">
                    {new Date(selectedWithdrawal.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Statut</span>
                  {(() => {
                    const cfg = getStatusConfig(selectedWithdrawal.status);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                        {cfg.label}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
