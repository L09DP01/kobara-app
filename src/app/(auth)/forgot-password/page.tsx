"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, KeyRound, Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { requestPasswordReset } from '../actions'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const { language } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await requestPasswordReset(email, language);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
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
        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
          <KeyRound className="w-6 h-6 text-kobara-orange" />
        </div>
        <h1 className="text-3xl font-black text-kobara-primary tracking-tight mb-3">
          {language === "fr" ? "Mot de passe oublié" : "Reset password"}
        </h1>
        <p className="text-kobara-secondary font-medium leading-relaxed">
          {language === "fr" 
            ? "Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe." 
            : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900 mb-0.5">
              {language === "fr" ? "E-mail envoyé" : "Email sent"}
            </p>
            <p className="text-emerald-700 leading-relaxed text-xs">
              {language === "fr"
                ? "Si un compte existe pour cette adresse, un e-mail avec les instructions de réinitialisation a été envoyé."
                : "If an account exists for this address, an email with reset instructions has been sent."}
            </p>
          </div>
        </div>
      )}

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
          <label className="block text-sm font-bold text-kobara-primary mb-2" htmlFor="email">
            {language === "fr" ? "Adresse e-mail" : "Email address"}
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

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#E53E3E] text-white rounded-xl px-4 py-4 font-bold text-[15px] hover:bg-red-600 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-8 group disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {language === "fr" ? "Envoi en cours..." : "Sending..."}
            </>
          ) : (
            <>
              {language === "fr" ? "Envoyer le lien de réinitialisation" : "Send reset link"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-kobara-secondary hover:text-kobara-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "fr" ? "Retour à la connexion" : "Back to login"}
        </Link>
      </div>
    </div>
  )
}
