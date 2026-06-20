"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  const isNetworkError = error.message.toLowerCase().includes("fetch") || 
                         error.message.toLowerCase().includes("network") || 
                         error.message.toLowerCase().includes("connection");

  return (
    <div className="min-h-[100dvh] bg-[#050D1A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden selection:bg-orange-500/30">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div className="mb-12 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Icone.png"
            alt="Kobara Logo"
            className="w-10 h-10 object-contain grayscale opacity-80"
          />
          <span className="text-2xl font-bold text-slate-300 tracking-tight">Kobara</span>
        </Link>
      </div>
      
      {/* Icon with pulsing animation */}
      <div className="relative z-10 mb-8 animate-in zoom-in-50 duration-500">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-[#0A1628] border border-red-500/20 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/10">
          <AlertTriangle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
        </div>
      </div>
      
      {/* Text Content */}
      <div className="z-10 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          {isNetworkError ? "Problème de connexion" : "Une erreur est survenue"}
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed text-sm sm:text-base">
          {isNetworkError 
            ? "Impossible de se connecter aux serveurs de Kobara. Veuillez vérifier votre connexion internet et réessayer." 
            : "Nous avons rencontré un problème inattendu lors du traitement de votre demande. Notre équipe a été notifiée."}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => reset()}
            className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Réessayer
          </button>
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Error Details (Only visible in dev or if specific) */}
      {error.digest && (
        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <p className="text-xs text-slate-600 font-medium">
            Error ID: {error.digest}
          </p>
        </div>
      )}
    </div>
  );
}
