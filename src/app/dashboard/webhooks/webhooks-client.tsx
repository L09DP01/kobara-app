'use client'

import { useState } from 'react';
import { addWebhookEndpoint, deleteWebhookEndpoint } from './actions';

export function WebhooksClient({ endpoints }: { endpoints: any[] }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      setLoading(true);
      await addWebhookEndpoint(url);
      setIsModalOpen(false);
      setUrl('');
    } catch (err) {
      alert("Erreur lors de l'ajout du webhook");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce webhook ?")) {
      try {
        await deleteWebhookEndpoint(id);
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Webhooks</h1>
          <p className="text-text-secondary text-body-sm mt-1">Configurez des endpoints pour recevoir des événements en temps réel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-body-base text-body-sm font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Ajouter un endpoint
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-headline-md font-headline-md text-text-primary mb-4">Ajouter un endpoint</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-1">URL de l'endpoint</label>
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://votre-site.com/api/webhooks"
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
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
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden ambient-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-bright">
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">URL de l'endpoint</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Secret de signature</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Statut</th>
                <th className="py-4 px-6 text-right font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border-subtle">
              {endpoints.length > 0 ? endpoints.map(endpoint => (
                <tr key={endpoint.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-medium text-text-primary">{endpoint.url}</div>
                  </td>
                  <td className="py-4 px-6 font-mono-code text-sm">
                    {endpoint.secret}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      endpoint.status === 'active' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${endpoint.status === 'active' ? 'bg-status-success' : 'bg-status-warning'}`}></span>
                      {endpoint.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(endpoint.id)}
                        className="p-1.5 text-status-error hover:bg-error-container rounded transition-colors" 
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    Aucun webhook configuré.
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
