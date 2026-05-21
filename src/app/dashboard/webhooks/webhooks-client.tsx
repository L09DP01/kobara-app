'use client'

import { useState } from 'react';
import { addWebhookEndpoint, deleteWebhookEndpoint } from './actions';
import { toast } from "sonner";

export function WebhooksClient({ endpoints }: { endpoints: any[] }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      setLoading(true);
      await addWebhookEndpoint(url);
      setIsModalOpen(false);
      setUrl('');
      toast.success("Webhook ajouté avec succès !");
    } catch (err) {
      toast.error("Erreur lors de l'ajout du webhook");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWebhookEndpoint(id);
      setConfirmDeleteId(null);
      toast.success("Webhook supprimé avec succès !");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const webhookEvents = ['payment.succeeded', 'payment.failed', 'payment.pending', 'withdrawal.paid'];

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Webhooks</h1>
          <p className="text-text-secondary text-sm mt-1">Configurez des endpoints pour recevoir des événements en temps réel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Ajouter un endpoint
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-blue-600">info</span>
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">Comment fonctionnent les webhooks ?</p>
          <p className="text-xs text-blue-700 mt-0.5">Kobara envoie des requêtes HTTP POST à vos endpoints lorsqu'un événement se produit (paiement réussi, échoué, etc.). Chaque requête est signée avec votre clé secrète.</p>
        </div>
      </div>

      {/* Endpoints as Cards */}
      {endpoints.length > 0 ? (
        <div className="space-y-4">
          {endpoints.map(endpoint => (
            <div key={endpoint.id} className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-text-secondary">language</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-text-primary truncate">{endpoint.url}</p>
                      <p className="text-xs text-text-secondary mt-0.5">Ajouté le {new Date(endpoint.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                    endpoint.status === 'active' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${endpoint.status === 'active' ? 'bg-status-success animate-pulse' : 'bg-status-warning'}`}></span>
                    {endpoint.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Secret */}
                <div className="bg-surface-container-lowest rounded-lg p-3 flex items-center justify-between mb-4 border border-border-subtle">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">key</span>
                    <code className="text-xs font-mono text-text-secondary truncate">{endpoint.secret?.substring(0, 20)}••••••</code>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(endpoint.secret || '')}
                    className="text-text-secondary hover:text-primary transition-colors flex-shrink-0 p-1"
                    title="Copier le secret"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>

                {/* Events */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {webhookEvents.map(event => (
                    <span key={event} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      event.includes('succeeded') ? 'bg-green-50 text-green-700 border-green-100' :
                      event.includes('failed') ? 'bg-red-50 text-red-700 border-red-100' :
                      event.includes('pending') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-border-subtle bg-surface-container-lowest/50 flex justify-end gap-2">
                <button 
                  onClick={() => setConfirmDeleteId(endpoint.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-status-error hover:bg-status-error/5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-card rounded-xl border border-border-subtle p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-text-secondary/30">webhook</span>
          </div>
          <p className="text-sm text-text-secondary font-medium">Aucun webhook configuré</p>
          <p className="text-xs text-text-secondary/60 mt-1 max-w-sm mx-auto">Configurez votre premier webhook pour recevoir des notifications en temps réel</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-5 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Ajouter un endpoint
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-bold text-text-primary">Ajouter un endpoint</h2>
              <p className="text-xs text-text-secondary mt-1">Kobara enverra des requêtes POST à cette URL</p>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-text-secondary font-medium mb-1.5">URL de l'endpoint</label>
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://votre-site.com/api/webhooks"
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
                <p className="text-xs text-text-secondary/60 mt-1.5">L'URL doit être publiquement accessible et supporter les requêtes POST</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-text-secondary hover:bg-surface-container rounded-xl transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm font-semibold shadow-sm"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-card rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-status-error/10 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-status-error">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary text-center mb-2">Supprimer ce webhook ?</h3>
            <p className="text-sm text-text-secondary text-center mb-6">Cette action est irréversible. Vous ne recevrez plus de notifications sur cet endpoint.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-border-subtle text-text-secondary rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 px-4 py-2.5 bg-status-error text-white rounded-xl text-sm font-semibold hover:bg-status-error/90 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
