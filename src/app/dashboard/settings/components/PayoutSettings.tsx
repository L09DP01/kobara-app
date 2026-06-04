'use client'

import { useState } from 'react';
import { updatePayoutSettings } from '../actions';

export function PayoutSettings({ settings }: { settings: any }) {
  const generalSettings = settings?.settings_json || {};
  const [moncashNumber, setMoncashNumber] = useState(generalSettings.saved_moncash_number || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!moncashNumber) {
      setErrorMsg("Veuillez entrer un numéro MonCash valide.");
      return;
    }

    try {
      setIsSaving(true);
      await updatePayoutSettings(moncashNumber);
      setSuccessMsg("Votre compte de retrait a été mis à jour.");
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Comptes de Retrait</h2>
        <p className="text-sm text-slate-500 mb-8">
          Ajoutez un compte MonCash pour recevoir vos paiements plus rapidement. Pour l'instant, seul MonCash est supporté.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-status-success/10 border border-status-success/20 text-status-success text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#eb1c24]/10 flex items-center justify-center border border-[#eb1c24]/20">
                <span className="text-[#eb1c24] font-bold text-xs tracking-tighter">MC</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">MonCash</h3>
                <p className="text-xs text-slate-500">Transfert instantané</p>
              </div>
              <div className="ml-auto">
                <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                  Actif
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Numéro de réception MonCash</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                      smartphone
                    </span>
                    <input 
                      type="tel" 
                      value={moncashNumber}
                      onChange={(e) => setMoncashNumber(e.target.value)}
                      placeholder="3xxxxxxx ou 4xxxxxxx"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ce numéro sera utilisé par défaut lors de vos demandes de retrait depuis le tableau de bord.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer le compte'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 opacity-50 grayscale pointer-events-none">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
              <span className="material-symbols-outlined text-slate-400">account_balance</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Virement Bancaire (Sogebank / Unibank)</h3>
              <p className="text-xs text-slate-500">Bientôt disponible</p>
            </div>
            <div className="ml-auto">
              <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold">
                Bientôt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
