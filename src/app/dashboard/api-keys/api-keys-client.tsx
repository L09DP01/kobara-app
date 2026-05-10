'use client'

import { useState } from 'react';
import { generateApiKey, revokeApiKey } from './actions';

export function ApiKeysClient({ initialKeys }: { initialKeys: any[] }) {
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<{ rawKey: string, name: string, environment: string } | null>(null);
  const [environment, setEnvironment] = useState<'live' | 'test'>('test');
  const [showKey, setShowKey] = useState(false);

  const filteredKeys = initialKeys.filter(k => k.environment === environment);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setShowKey(false);
      const name = "Clé générée le " + new Date().toLocaleDateString('fr-FR');
      const result = await generateApiKey(name, environment);
      setNewKey(result);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur lors de la génération de la clé");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir révoquer cette clé ? Elle ne fonctionnera plus.")) {
      try {
        await revokeApiKey(id);
      } catch (err) {
        alert("Erreur lors de la révocation");
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copié dans le presse-papiers !");
  };

  return (
    <div className="max-w-[1080px] w-full mx-auto flex flex-col gap-8 pb-12">
      {/* Page Header & Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-lg text-text-primary">Clés API</h1>
        <div className="flex items-center bg-surface-container-lowest border border-border-subtle rounded-lg p-1">
          <button 
            onClick={() => setEnvironment('live')}
            className={`px-4 py-1.5 text-body-sm font-body-sm font-medium rounded transition-colors ${environment === 'live' ? 'bg-surface-container-high text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Live Keys
          </button>
          <button 
            onClick={() => setEnvironment('test')}
            className={`px-4 py-1.5 text-body-sm font-body-sm font-medium rounded transition-colors ${environment === 'test' ? 'bg-surface-container-high text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Test Keys
          </button>
        </div>
      </div>

      {/* Security Info Box */}
      <div className="bg-surface-container-low border border-border-subtle rounded-xl p-4 flex items-start gap-4">
        <div className="text-status-warning bg-status-warning/10 p-2 rounded-full flex-shrink-0">
          <span className="material-symbols-outlined text-[20px]">gpp_maybe</span>
        </div>
        <div>
          <h3 className="font-body-base text-body-base font-medium text-text-primary mb-1">
            Gardez vos clés secrètes en sécurité
          </h3>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Vos clés d&apos;API secrètes peuvent effectuer n&apos;importe quelle action sur votre compte. Ne les partagez pas, ne les intégrez pas dans du code côté client et ne les publiez pas sur des dépôts publics.
          </p>
        </div>
      </div>

      {newKey && (
        <div className="bg-green-50 border border-status-success rounded-xl p-6 mb-4">
          <h3 className="font-body-base font-medium text-status-success mb-2">Nouvelle Clé Secrète {newKey.environment === 'live' ? 'Live' : 'Test'} Générée</h3>
          <p className="text-body-sm mb-4">Veuillez copier cette clé immédiatement. Vous ne pourrez plus la voir une fois cette page fermée.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-status-success/30 rounded-lg px-3 py-2 font-mono-code text-text-primary flex items-center justify-between">
              <span>{showKey ? newKey.rawKey : '•'.repeat(newKey.rawKey.length)}</span>
              <button 
                onClick={() => setShowKey(!showKey)}
                className="text-status-success hover:text-status-success/80 transition-colors flex items-center"
                title={showKey ? "Masquer la clé" : "Afficher la clé"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <button 
              onClick={() => copyToClipboard(newKey.rawKey)}
              className="p-2 text-status-success hover:bg-status-success/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
              title="Copier la clé"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
              Copier
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-4 text-sm underline text-status-success">
            J&apos;ai copié ma clé
          </button>
        </div>
      )}

      {/* Standard Keys Card */}
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary mb-2">Clés Secrètes</h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Ces clés vous permettent d&apos;authentifier les requêtes API au nom de votre compte.
            </p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm font-medium hover:bg-surface-tint transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {loading ? "Génération..." : "Nouvelle clé"}
          </button>
        </div>
        <div className="p-0 flex flex-col">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-lowest">
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase">Nom</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase">Statut</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase">Créée le</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredKeys.length > 0 ? filteredKeys.map((key) => (
                <tr key={key.id} className={`hover:bg-surface-container-low transition-colors group ${key.revoked_at ? 'opacity-50' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="font-body-base font-medium text-text-primary">{key.name}</div>
                    <div className="font-mono-code text-sm text-text-secondary mt-1">
                      {key.revoked_at ? `${key.prefix}...révoquée` : `${key.prefix}...cachée`}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {key.revoked_at ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-high text-text-secondary text-xs font-medium">
                        Révoquée
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-status-success/10 text-status-success text-xs font-medium border border-status-success/20">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-body-sm text-text-secondary">
                    {new Date(key.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!key.revoked_at && (
                      <button 
                        onClick={() => handleRevoke(key.id)}
                        className="text-status-error hover:bg-error-container px-3 py-1.5 rounded transition-colors text-sm font-medium"
                      >
                        Révoquer
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    Aucune clé API trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
