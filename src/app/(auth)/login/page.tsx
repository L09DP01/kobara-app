"use client"

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from '@/context/LanguageContext'
import { verifyCredentialsAction } from '../actions'

function LoginContent() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const errorParam = searchParams.get('error');
  const registered = searchParams.get('registered') === 'true';
  const resetSuccess = searchParams.get('reset') === 'success';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First verify the credentials via Server Action to get precise errors
      const verifyRes = await verifyCredentialsAction(email, password, language);
      if (verifyRes?.error) {
        setError(verifyRes.error);
        setLoading(false);
        return;
      }

      // If validation succeeds, log in with NextAuth
      const res = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        language,
        redirect: false
      });

      if (res?.error) {
        let mappedError = res.error;
        if (res.error === 'CredentialsSignin') {
          mappedError = t("auth.loginFailed");
        } else if (res.error === 'Email not confirmed' || res.error.toLowerCase().includes('confirm')) {
          mappedError = t("auth.loginVerificationPending");
        }
        setError(mappedError);
        setLoading(false);
      } else {
        // Success! Redirect to the dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || (language === "fr" ? "Une erreur inattendue est survenue." : "An unexpected error occurred."));
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      {/* Back to Home & Mobile Logo */}
      <div className="flex flex-col gap-6 mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "fr" ? "Retour à l'accueil" : "Back to home"}
        </Link>
        
        <div className="lg:hidden flex items-center gap-2">
          <div className="bg-white rounded-xl shadow-lg flex items-center justify-center w-10 h-10 p-1">
            <Image src="/Icone.png" alt="Kobara Logo" width={32} height={32} />
          </div>
          <span className="text-kobara-primary font-bold text-lg tracking-tight">Kobara</span>
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-kobara-primary tracking-tight mb-3">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-gray-500 font-medium leading-relaxed">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      {/* Success Notification Banner */}
      {registered && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900 mb-0.5">{t("auth.successTitle")}</p>
            <p className="text-emerald-700 leading-relaxed text-xs">
              {t("auth.successDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Reset Password Success Banner */}
      {resetSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900 mb-0.5">
              {language === "fr" ? "Mot de passe réinitialisé" : "Password reset successfully"}
            </p>
            <p className="text-emerald-700 leading-relaxed text-xs">
              {language === "fr"
                ? "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
                : "Your password has been successfully reset. You can now log in with your new password."}
            </p>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-900 mb-0.5">{language === "fr" ? "Erreur de connexion" : "Login error"}</p>
            <p className="text-rose-700 leading-relaxed text-xs">
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="email">
            {t("auth.emailLabel")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm"
              placeholder="you@company.com"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider" htmlFor="password">
              {t("auth.passwordLabel")}
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-kobara-red hover:text-rose-600 transition-colors">
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm"
              placeholder="••••••••"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#E53E3E] text-white rounded-xl px-4 py-3.5 font-bold text-[15px] hover:bg-red-600 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {language === "fr" ? "Connexion en cours..." : "Signing in..."}
            </>
          ) : (
            t("auth.loginBtn")
          )}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] flex-1 bg-gray-200"></div>
          <span className="text-xs font-medium text-gray-400">{language === "fr" ? "Ou continuer avec" : "Or continue with"}</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        <button 
          type="button"
          onClick={async () => {
            if (!email) {
              setError(language === "fr" ? "Veuillez entrer votre e-mail pour utiliser Passkey." : "Please enter your email to use Passkey.");
              return;
            }
            try {
              setLoading(true);
              setError('');
              const { startAuthentication } = await import('@simplewebauthn/browser');
              
              // 1. Get options
              const resp = await fetch('/api/auth/passkey/generate-authentication-options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
              
              if (!resp.ok) {
                const data = await resp.json();
                throw new Error(data.error || "Failed to get passkey options");
              }
              const options = await resp.json();
              
              // 2. Authenticate with browser
              const assertion = await startAuthentication(options);
              
              // 3. Login via NextAuth
              const res = await signIn('credentials', {
                email: email.toLowerCase().trim(),
                passkey_response: JSON.stringify(assertion),
                language,
                redirect: false
              });

              if (res?.error) {
                setError(res.error);
                setLoading(false);
              } else {
                router.push('/dashboard');
                router.refresh();
              }
            } catch (err: any) {
              console.error(err);
              setError(err.message || (language === "fr" ? "Erreur biométrique" : "Biometric error"));
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-3.5 font-bold text-[15px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 mb-4"
        >
          <span className="material-symbols-outlined text-[20px] text-kobara-red">fingerprint</span>
          {language === "fr" ? "Se connecter avec Passkey" : "Sign in with Passkey"}
        </button>

        <button 
          type="button"
          className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-3.5 font-bold text-[15px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {language === "fr" ? "Continuer avec Google" : "Continue with Google"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-gray-500">
          {t("auth.dontHaveAccount")}{' '}
          <Link href="/register" className="font-bold text-kobara-red hover:text-red-700 transition-colors">
            {t("auth.signUpNow")}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-kobara-red" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
