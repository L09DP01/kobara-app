'use client'

import { useState } from 'react';
import { generateApiKey, revokeApiKey } from './actions';

export function ApiKeysClient({ 
  initialKeys, 
  apiCallsThisWeek = 0, 
  successRate = 100 
}: { 
  initialKeys: any[], 
  apiCallsThisWeek?: number, 
  successRate?: number 
}) {
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<{ rawKey: string, name: string, environment: string } | null>(null);
  const [environment, setEnvironment] = useState<'live' | 'test'>('test');
  const [showKey, setShowKey] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredKeys = initialKeys.filter(k => k.environment === environment);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyName.trim()) {
      setError("Veuillez entrer un nom pour la clé API.");
      return;
    }
    
    try {
      setLoading(true);
      setShowKey(false);
      setError(null);
      setSuccess(null);
      const result = await generateApiKey(keyName, environment);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.rawKey) {
        setNewKey(result as { rawKey: string, name: string, environment: string });
        setShowCreateModal(false);
        setKeyName('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la génération de la clé");
    } finally {
      setLoading(false);
    }
  };

  const executeRevoke = async () => {
    if (!confirmRevokeId) return;
    try {
      setError(null);
      const result = await revokeApiKey(confirmRevokeId);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setSuccess("La clé a été supprimée avec succès.");
      setTimeout(() => {
        setSuccess(null);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setConfirmRevokeId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copié dans le presse-papiers !");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="max-w-[1080px] w-full mx-auto flex flex-col gap-8 pb-12">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Clés API</h1>
          <p className="text-sm text-text-secondary mt-1">Gérez vos clés secrètes pour l'intégration de l'API Kobara.</p>
        </div>
        <div className="flex items-center bg-surface-container-lowest border border-border-subtle rounded-xl p-1 shadow-sm w-fit">
          <button 
            onClick={() => setEnvironment('live')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${environment === 'live' ? 'bg-surface-card text-text-primary shadow border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <span className={`w-2 h-2 rounded-full ${environment === 'live' ? 'bg-status-success animate-pulse' : 'bg-surface-container-high'}`}></span>
            Live Mode
          </button>
          <button 
            onClick={() => setEnvironment('test')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${environment === 'test' ? 'bg-surface-card text-text-primary shadow border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <span className={`w-2 h-2 rounded-full ${environment === 'test' ? 'bg-blue-500 animate-pulse' : 'bg-surface-container-high'}`}></span>
            Test Mode
          </button>
        </div>
      </div>

      {/* Security Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-blue-900">
          <span className="material-symbols-outlined text-[120px]">shield</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 relative z-10">
          <span className="material-symbols-outlined text-[22px] text-blue-600">shield_lock</span>
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-blue-900 mb-1">
            Gardez vos clés secrètes en sécurité
          </h3>
          <p className="text-xs text-blue-800/80 leading-relaxed max-w-3xl">
            Vos clés d'API secrètes peuvent effectuer n'importe quelle action sur votre compte. Ne les partagez pas, ne les intégrez pas dans du code côté client et ne les publiez pas sur des dépôts publics.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-status-error text-[20px]">error</span>
          <p className="text-sm text-status-error font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-status-success text-[20px]">check_circle</span>
          <p className="text-sm text-status-success font-medium">{success}</p>
        </div>
      )}

      {/* New Key Banner */}
      {newKey && (
        <div className="bg-surface-card border border-status-success rounded-2xl p-6 shadow-md border-l-4 border-l-status-success animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-status-success text-[24px]">key</span>
            <h3 className="text-lg font-bold text-text-primary">Nouvelle Clé Secrète {newKey.environment === 'live' ? 'Live' : 'Test'}</h3>
          </div>
          <p className="text-sm text-text-secondary mb-5">Veuillez copier cette clé immédiatement. Vous ne pourrez plus la voir une fois cette page fermée.</p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-lowest border border-border-subtle p-2 rounded-xl">
            <div className="flex-1 bg-surface-card border border-border-subtle rounded-lg px-4 py-3 font-mono text-sm text-text-primary flex items-center justify-between">
              <span>{showKey ? newKey.rawKey : '•'.repeat(newKey.rawKey.length)}</span>
              <button 
                onClick={() => setShowKey(!showKey)}
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center p-1"
                title={showKey ? "Masquer la clé" : "Afficher la clé"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <button 
              onClick={() => copyToClipboard(newKey.rawKey)}
              className="px-6 py-3 bg-status-success text-white rounded-lg hover:bg-status-success/90 transition-all font-semibold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Copier la clé
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setNewKey(null)} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              J'ai copié ma clé, fermer ce message
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest/50">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Clés Secrètes</h2>
            <p className="text-sm text-text-secondary">
              Ces clés permettent d'authentifier les requêtes API au nom de votre compte.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">vpn_key</span>
            Nouvelle clé secrète
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest">
                <th className="py-3.5 px-6 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Nom & Clé partielle</th>
                <th className="py-3.5 px-6 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Statut</th>
                <th className="py-3.5 px-6 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créée le</th>
                <th className="py-3.5 px-6 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredKeys.length > 0 ? filteredKeys.map((key) => (
                <tr key={key.id} className={`hover:bg-surface-container-lowest transition-colors group ${key.revoked_at ? 'opacity-50' : ''} border-l-[3px] border-l-transparent hover:border-l-primary`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${key.revoked_at ? 'bg-surface-container text-text-secondary' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{key.name}</div>
                        <div className="font-mono text-xs text-text-secondary mt-1 tracking-wide">
                          {key.revoked_at ? `${key.prefix}••••••••••• (Révoquée)` : `${key.prefix}•••••••••••`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {key.revoked_at ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-text-secondary text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px]">block</span>
                        Révoquée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {new Date(key.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!key.revoked_at && (
                      <button 
                        onClick={() => setConfirmRevokeId(key.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-error hover:bg-status-error/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Révoquer
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-4xl text-text-secondary/30">vpn_key_off</span>
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Aucune clé API {environment === 'test' ? 'de Test' : 'Live'} trouvée</p>
                    <p className="text-xs text-text-secondary/60 mt-1">Générez une clé pour commencer à utiliser l'API.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-1">Appels API cette semaine</p>
            <p className="text-3xl font-bold text-text-primary">{apiCallsThisWeek}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary">
            <span className="material-symbols-outlined text-[24px]">stacked_line_chart</span>
          </div>
        </div>
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-1">Taux de succès API</p>
            <p className="text-3xl font-bold text-text-primary">{successRate}%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary">
            <span className="material-symbols-outlined text-[24px]">network_check</span>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {confirmRevokeId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-subtle animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-status-error/10 text-status-error flex items-center justify-center mb-5 mx-auto">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Êtes-vous sûr ?</h3>
            <p className="text-sm text-text-secondary mb-8 text-center leading-relaxed">
              La révocation de cette clé est <strong>définitive</strong>. Toute application ou intégration utilisant cette clé cessera de fonctionner immédiatement.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmRevokeId(null)}
                className="flex-1 px-4 py-2.5 border border-border-subtle rounded-xl font-semibold text-sm text-text-secondary hover:bg-surface-container transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={executeRevoke}
                className="flex-1 px-4 py-2.5 bg-status-error text-white rounded-xl font-semibold text-sm hover:bg-status-error/90 transition-colors shadow-sm"
              >
                Oui, révoquer la clé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border-subtle animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Nouvelle clé {environment === 'live' ? 'Live' : 'Test'}</h3>
              <button onClick={() => { setShowCreateModal(false); setKeyName(''); setError(null); }} className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Nom de la clé</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-text-primary"
                  placeholder="Ex: Backend Prod, Serveur de Test..."
                />
                <p className="text-xs text-text-secondary mt-2">Ce nom vous aidera à identifier l'utilisation de cette clé plus tard.</p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => { setShowCreateModal(false); setKeyName(''); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-border-subtle rounded-xl font-semibold text-sm text-text-secondary hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={loading || !keyName.trim()}
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Génération...
                    </>
                  ) : "Générer la clé"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
