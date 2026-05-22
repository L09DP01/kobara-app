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
    <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-text-primary mb-1">Comptes de Retrait</h2>
        <p className="text-sm text-text-secondary mb-8">
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
          <div className="bg-surface-container-low p-6 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#eb1c24]/10 flex items-center justify-center border border-[#eb1c24]/20">
                <span className="text-[#eb1c24] font-bold text-xs tracking-tighter">MC</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">MonCash</h3>
                <p className="text-xs text-text-secondary">Transfert instantané</p>
              </div>
              <div className="ml-auto">
                <span className="px-2.5 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
                  Actif
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Numéro de réception MonCash</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 material-symbols-outlined text-[20px]">
                      smartphone
                    </span>
                    <input 
                      type="tel" 
                      value={moncashNumber}
                      onChange={(e) => setMoncashNumber(e.target.value)}
                      placeholder="3xxxxxxx ou 4xxxxxxx"
                      className="w-full pl-12 pr-4 py-3 bg-surface-card border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-text-secondary/70 mt-2">
                  Ce numéro sera utilisé par défaut lors de vos demandes de retrait depuis le tableau de bord.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/20 disabled:opacity-70 flex items-center gap-2"
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

        <div className="mt-8 pt-6 border-t border-border-subtle">
          <div className="flex items-center gap-3 mb-4 opacity-50 grayscale pointer-events-none">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-border-subtle">
              <span className="material-symbols-outlined text-text-secondary">account_balance</span>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Virement Bancaire (Sogebank / Unibank)</h3>
              <p className="text-xs text-text-secondary">Bientôt disponible</p>
            </div>
            <div className="ml-auto">
              <span className="px-2.5 py-1 rounded-full bg-surface-container border border-border-subtle text-text-secondary text-xs font-medium">
                Bientôt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
