'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { logout } from '../../actions';
import { 
  sendEmailOtpAction, 
  verifyEmailOtpAction 
} from '@/app/dashboard/settings/actions';
import { 
  Shield, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  LogOut,
  RefreshCw 
} from 'lucide-react';

export default function ChallengeEmailPage() {
  const supabase = createClient();
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [userEmail, setUserEmail] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isSending, setIsSending] = useState(false);

  // Initialize and automatically send the OTP on mount
  useEffect(() => {
    const initChallenge = async () => {
      try {
        setLoadingUser(true);
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const user = session?.user;
        if (!user) {
          router.replace('/login');
          return;
        }
        setUserEmail(user.email || '');

        // Automatically trigger send on mount
        setIsSending(true);
        await sendEmailOtpAction();
      } catch (err: any) {
        console.error("Error auto-sending Email OTP:", err);
        // If they already sent in last 60 seconds (rate limit error), just log it and ignore
        if (err.message && err.message.includes("Veuillez attendre")) {
          // Ignore
        } else {
          setError("Impossible de déclencher l'envoi du code par e-mail.");
        }
      } finally {
        setLoadingUser(false);
        setIsSending(false);
      }
    };

    initChallenge();
  }, [router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isSending) return;
    setError('');
    setIsSending(true);
    try {
      await sendEmailOtpAction();
      setResendCooldown(60);
      setError('');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setError('');
    setLoading(true);

    try {
      const res = await verifyEmailOtpAction(otp);
      if (res.success) {
        setSuccess(true);
        window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.kobara.app';
      }
    } catch (err: any) {
      setError(err.message || 'Le code de vérification est invalide ou expiré.');
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

  if (loadingUser) {
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
          Entrez le code de vérification temporaire envoyé par e-mail.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 rounded-2xl sm:px-10 space-y-6">
          
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex gap-3 items-start">
            <Mail className="w-5 h-5 text-kobara-red shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 leading-relaxed">
              <span className="font-bold">Protection active : </span>
              Un code à 6 chiffres a été expédié à l'adresse <strong>{userEmail}</strong>. Veuillez le saisir pour finaliser votre connexion.
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

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={resendCooldown > 0 || isSending}
              onClick={handleResend}
              className="flex items-center gap-1.5 text-xs font-semibold text-kobara-red hover:text-rose-600 disabled:text-gray-400 transition-colors"
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer un code"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Connexion
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
