"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TestPaymentSimulationPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSimulate = async (simulateStatus: "succeeded" | "failed") => {
    setStatus("loading");
    
    try {
      const res = await fetch("/api/v1/payments/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference: ref,
          status: simulateStatus
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Simulation failed");
      }

      setStatus(simulateStatus === "succeeded" ? "success" : "error");
      setMessage(`Paiement simulé comme ${simulateStatus === "succeeded" ? "réussi" : "échoué"}. Vous pouvez fermer cette page ou retourner au tableau de bord.`);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Erreur lors de la simulation du paiement.");
    }
  };

  if (!ref) {
    return (
      <div className="min-h-screen bg-[#050D1A] flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Référence manquante</h1>
        <p className="text-slate-400">Aucune référence de paiement fournie.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050D1A] flex flex-col items-center justify-center p-6 relative selection:bg-blue-500/30">
      
      <div className="absolute top-0 right-0 p-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          Mode Test
        </span>
      </div>

      <div className="w-full max-w-md bg-[#0A1628] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
            <span className="material-symbols-outlined text-3xl">science</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Simulateur de Paiement</h1>
          <p className="text-sm text-slate-400">Réf: <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">{ref}</span></p>
        </div>

        {status === "idle" && (
          <div className="space-y-4 mt-8">
            <p className="text-slate-300 text-sm mb-6">Choisissez le statut que vous souhaitez simuler pour ce paiement test :</p>
            
            <button 
              onClick={() => handleSimulate("succeeded")}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Simuler un succès
            </button>
            
            <button 
              onClick={() => handleSimulate("failed")}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <XCircle className="w-5 h-5 text-red-400" />
              Simuler un échec
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium text-sm">Simulation en cours...</p>
          </div>
        )}

        {(status === "success" || status === "error") && (
          <div className="py-6 animate-in fade-in zoom-in-95 duration-500">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${status === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
              {status === "success" ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {status === "success" ? "Paiement réussi" : "Paiement échoué"}
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed px-4">{message}</p>
            
            <Link href="/dashboard" className="inline-flex py-3 px-6 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-bold text-sm transition-all">
              Retour au Dashboard
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
