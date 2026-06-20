'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { logout } from '../../actions';
import { 
  Shield, 
  Smartphone, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  LogOut 
} from 'lucide-react';

export default function ChallengeTotpPage() {
  const supabase = createClient();
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [userEmail, setUserEmail] = useState('');
  const [factorId, setFactorId] = useState('');
  const [loadingFactors, setLoadingFactors] = useState(true);

  // Load active factors to challenge
  useEffect(() => {
    const initChallenge = async () => {
      try {
        setLoadingFactors(true);
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const user = session?.user;
        if (!user) {
          router.replace('/login');
          return;
        }
        setUserEmail(user.email || '');

        const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const active = data.totp.find((f: any) => f.status === 'verified');
        if (!active) {
          // If no active factors exist, but they reached here, bypass or redirect
          console.warn("No active TOTP factors found. Redirecting to dashboard.");
          window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.kobara.app';
          return;
        }

        setFactorId(active.id);
      } catch (err: any) {
        console.error("Error initializing MFA challenge:", err);
        setError("Impossible d'initialiser le protocole de double validation.");
      } finally {
        setLoadingFactors(false);
      }
    };

    initChallenge();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !factorId) return;

    setError('');
    setLoading(true);

    try {
      // 1. Create a challenge
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // 2. Verify the challenge
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: otp
      });

      if (verify.error) throw verify.error;

      setSuccess(true);
      
      // 3. Refresh session and redirect to dashboard
      await supabase.auth.refreshSession();
      window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.kobara.app';
    } catch (err: any) {
      setError(err.message || 'Le code de vérification est invalide. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await logout();
    } catch (err) {
      router.replace('/login');
    }
  };

  if (loadingFactors) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <Shield className="w-12 h-12 text-kobara-red animate-bounce" />
          <p className="text-sm font-semibold text-gray-500">Sécurisation de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-rose-50 rounded-2xl text-kobara-red">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Double Validation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entrez le code généré par votre application d'authentification.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 rounded-2xl sm:px-10 space-y-6">
          
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex gap-3 items-start">
            <Smartphone className="w-5 h-5 text-kobara-red shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 leading-relaxed">
              <span className="font-bold">Protection active : </span>
              L'application d'authentification configurée sur votre smartphone est requise pour accéder au compte <strong>{userEmail}</strong>.
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-medium animate-in fade-in duration-300">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs">Validation réussie. Redirection en cours...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Code à 6 chiffres
              </label>
              <div className="flex justify-center">
                <input
                  id="otp"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={loading || success}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-56 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-center text-2xl font-bold tracking-[0.4em] text-gray-900 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-inner"
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success || otp.length !== 6}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-kobara-red hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kobara-red transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Vérification...
                </span>
              ) : (
                "Valider et se connecter"
              )}
            </button>
          </form>

          <div className="border-t border-gray-150 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Retourner à la page de connexion
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
