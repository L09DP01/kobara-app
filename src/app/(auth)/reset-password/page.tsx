"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, LockKeyhole, XCircle, Loader2 } from 'lucide-react'
import { resetPassword } from '../actions'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'

function ResetPasswordContent() {
  const { language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? '' : (language === "fr" ? "Lien de réinitialisation manquant ou invalide." : "Missing or invalid reset link."));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(language === "fr" ? "Lien de réinitialisation invalide." : "Invalid reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === "fr" ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await resetPassword(token, password, language);
      if (res?.error) {
        setError(res.error);
      } else {
        // Redirect to login page with a success query param
        router.push('/login?reset=success');
      }
    } catch (err: any) {
      setError(err?.message || (language === "fr" ? "Une erreur inattendue est survenue." : "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="bg-white rounded-xl shadow-lg flex items-center justify-center w-10 h-10 p-1">
          <Image src="/Icone.png" alt="Kobara Logo" width={32} height={32} />
        </div>
        <span className="text-kobara-primary font-bold text-lg tracking-tight">Kobara</span>
      </div>

      <div className="mb-10">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
          <LockKeyhole className="w-6 h-6 text-kobara-red" />
        </div>
        <h1 className="text-3xl font-black text-kobara-primary tracking-tight mb-3">
          {language === "fr" ? "Nouveau mot de passe" : "Set new password"}
        </h1>
        <p className="text-kobara-secondary font-medium leading-relaxed">
          {language === "fr"
            ? "Votre nouveau mot de passe doit comporter au moins 8 caractères."
            : "Your new password must be at least 8 characters long."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-900 mb-0.5">
              {language === "fr" ? "Erreur" : "Error"}
            </p>
            <p className="text-rose-700 leading-relaxed text-xs">
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-kobara-primary mb-2" htmlFor="password">
            {language === "fr" ? "Nouveau mot de passe" : "New password"}
          </label>
          <input 
            id="password"
            name="password"
            type="password" 
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm"
            placeholder={language === "fr" ? "Min. 8 caractères" : "Min. 8 characters"}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-kobara-primary mb-2" htmlFor="confirm_password">
            {language === "fr" ? "Confirmer le mot de passe" : "Confirm new password"}
          </label>
          <input 
            id="confirm_password"
            name="confirm_password"
            type="password" 
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm"
            placeholder={language === "fr" ? "Confirmer le mot de passe" : "Confirm password"}
          />
        </div>

        <button 
          type="submit"
          disabled={loading || !token}
          className="w-full bg-[#E53E3E] text-white rounded-xl px-4 py-4 font-bold text-[15px] hover:bg-red-600 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-8 group disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {language === "fr" ? "Mise à jour..." : "Updating..."}
            </>
          ) : (
            <>
              {language === "fr" ? "Mettre à jour le mot de passe" : "Update password"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-kobara-red" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
