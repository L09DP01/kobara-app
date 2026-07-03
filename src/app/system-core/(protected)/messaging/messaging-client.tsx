'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAdminMerchants, sendBulkAdminMessage } from './actions';
import { Send, CheckCircle, AlertCircle, Search, Users, CheckSquare, Square, XCircle } from 'lucide-react';

interface Merchant {
  id: string;
  business_name: string;
  email: string;
}

export default function MessagingClient() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAdminMerchants().then(setMerchants);
  }, []);

  const filteredMerchants = merchants.filter(m => {
    const q = search.toLowerCase();
    return m.business_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  const toggleMerchant = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredMerchants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMerchants.map(m => m.id)));
    }
  };

  const selectedMerchants = merchants.filter(m => selectedIds.has(m.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) return;

    setResult(null);
    startTransition(async () => {
      const res = await sendBulkAdminMessage(Array.from(selectedIds), subject, message);
      setResult(res);
      if (res.success) {
        setSubject('');
        setMessage('');
        setSelectedIds(new Set());
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">MESSAGING CENTER</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merchant Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            SELECT MERCHANTS
          </h2>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Select All + Counter */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={selectAll} className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5">
              {selectedIds.size === filteredMerchants.length && filteredMerchants.length > 0
                ? <><CheckSquare className="w-3.5 h-3.5" /> TOUT DÉSÉLECTIONNER</>
                : <><Square className="w-3.5 h-3.5" /> TOUT SÉLECTIONNER</>
              }
            </button>
            <span className="text-xs text-slate-500">{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-1 max-h-[450px] overflow-y-auto">
            {filteredMerchants.map(m => {
              const isSelected = selectedIds.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMerchant(m.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all text-sm flex items-start gap-3 ${
                    isSelected
                      ? 'bg-red-950/40 text-red-400 border border-red-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 text-red-400" />
                      : <Square className="w-4 h-4 text-slate-600" />
                    }
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase">{m.business_name || 'UNNAMED'}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">{m.email}</div>
                  </div>
                </button>
              );
            })}
            {filteredMerchants.length === 0 && (
              <div className="text-center text-slate-500 py-8 text-sm">AUCUN MARCHAND</div>
            )}
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" />
            COMPOSE MESSAGE
          </h2>

          {selectedIds.size > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Recipients */}
              <div className="bg-slate-950/50 rounded-lg border border-slate-800/50 p-4">
                <div className="text-[10px] text-slate-500 mb-2">DESTINATAIRES ({selectedMerchants.length})</div>
                <div className="flex flex-wrap gap-2">
                  {selectedMerchants.map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs border border-slate-700">
                      {m.business_name || m.email}
                      <button type="button" onClick={() => toggleMerchant(m.id)} className="text-slate-500 hover:text-red-400">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs text-slate-500 mb-2 block">SUJET</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Correction de solde — Kobara"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs text-slate-500 mb-2 block">MESSAGE</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Collez votre message ici..."
                  required
                  rows={12}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              {/* Result */}
              {result && (
                <div className={`p-4 rounded-lg border text-sm space-y-2 ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {result.success ? (
                    <>
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        {result.sent}/{result.total} messages envoyés
                        {result.failed > 0 && <span className="text-red-400">({result.failed} échoué{result.failed > 1 ? 's' : ''})</span>}
                      </div>
                      <div className="space-y-1 mt-2">
                        {result.results?.map((r: any, i: number) => (
                          <div key={i} className={`text-xs flex items-center gap-2 ${r.success ? 'text-green-400' : 'text-red-400'}`}>
                            {r.success ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {r.business_name} — {r.email}
                            {r.error && <span className="text-red-400">({r.error})</span>}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {result.error}
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={isPending || !subject || !message}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-bold transition-colors text-sm tracking-wider"
              >
                <Send className="w-4 h-4" />
                {isPending ? 'ENVOI EN COURS...' : `ENVOYER À ${selectedIds.size} MARCHAND${selectedIds.size > 1 ? 'S' : ''}`}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              ← Sélectionnez un ou plusieurs marchands pour composer un message
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
