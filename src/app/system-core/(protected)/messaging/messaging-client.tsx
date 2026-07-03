'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAdminMerchants, sendAdminMessage } from './actions';
import { Send, CheckCircle, AlertCircle, Search, Users } from 'lucide-react';

interface Merchant {
  id: string;
  business_name: string;
  email: string;
}

export default function MessagingClient() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ success?: boolean; error?: string; email?: string; business_name?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAdminMerchants().then(setMerchants);
  }, []);

  const filteredMerchants = merchants.filter(m => {
    const q = search.toLowerCase();
    return m.business_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;

    setResult(null);
    const formData = new FormData();
    formData.set('merchantId', selectedMerchant.id);
    formData.set('subject', subject);
    formData.set('message', message);

    startTransition(async () => {
      const res = await sendAdminMessage(formData);
      setResult(res);
      if (res.success) {
        setSubject('');
        setMessage('');
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
            SELECT MERCHANT
          </h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredMerchants.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelectedMerchant(m); setResult(null); }}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all text-sm ${
                  selectedMerchant?.id === m.id
                    ? 'bg-red-950/40 text-red-400 border border-red-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="font-bold text-xs uppercase">{m.business_name || 'UNNAMED'}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{m.email}</div>
              </button>
            ))}
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

          {selectedMerchant ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Recipient */}
              <div className="bg-slate-950/50 rounded-lg border border-slate-800/50 p-4">
                <div className="text-[10px] text-slate-500 mb-1">DESTINATAIRE</div>
                <div className="text-sm text-slate-200 font-bold">{selectedMerchant.business_name}</div>
                <div className="text-xs text-slate-400 font-mono mt-1">{selectedMerchant.email}</div>
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
                <div className={`p-4 rounded-lg border text-sm ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {result.success ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Message envoyé à {result.email}
                    </div>
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
                {isPending ? 'ENVOI EN COURS...' : 'ENVOYER MESSAGE'}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              ← Sélectionnez un marchand pour composer un message
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
