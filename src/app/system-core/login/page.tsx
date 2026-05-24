'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemCoreLogin() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStep('code');
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      if (res.ok) {
        router.push('/system-core/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Code invalide');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            K
          </div>
        </div>
        <h1 className="text-xl font-bold text-center mb-2 tracking-widest text-slate-300">CORE SYSTEM</h1>
        <p className="text-center text-slate-500 text-xs mb-8">Restricted Access. Unauthorized entry is prohibited.</p>

        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">AUTHORIZATION IDENTIFIER (EMAIL)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-slate-200"
                placeholder="admin@kobara.com"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold py-3 rounded text-sm tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'REQUEST ACCESS CODE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-xs text-slate-400 mb-4 text-center">
              An authorization code has been dispatched to your secure channel.
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">AUTHORIZATION CODE</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-3 text-center text-xl tracking-[0.5em] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-slate-200"
                placeholder="••••••"
                autoComplete="off"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-sm tracking-wider transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
            >
              {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 mt-4 tracking-wider"
            >
              &larr; RETURN
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
