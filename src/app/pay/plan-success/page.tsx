"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Sparkles, Receipt, ShieldCheck, Zap, Key, ArrowRight, LayoutDashboard, Star } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import SuccessDialog from "@/components/ui/success-dialog";

function PlanSuccessContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get("plan") || "Pro Monthly";
  const amount = searchParams.get("amount") || "$29.99";
  const nextBilling = searchParams.get("next_billing") || "June 19, 2026";
  const reference = searchParams.get("ref") || `KOBARA-SUB-${Math.floor(100000 + Math.random() * 900000)}`;

  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate some random premium floating sparkles/particles
    const newSparkles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 1.5,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-kobara-red/10 via-kobara-orange/5 to-transparent blur-[160px] rounded-full pointer-events-none" />
      
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        {/* Decorative dynamic particles */}
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0], x: s.x * 4, y: s.y * 4 }}
            transition={{ duration: 3, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/4 w-1.5 h-1.5 bg-gradient-to-r from-kobara-orange to-kobara-red rounded-full pointer-events-none"
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="space-y-8"
        >
          {/* Top Success Badge */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 bg-gradient-to-br from-kobara-orange/20 to-kobara-red/20 rounded-3xl flex items-center justify-center border border-kobara-orange/30 shadow-2xl relative"
            >
              <CheckCircle2 className="w-10 h-10 text-kobara-orange" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-kobara-orange/40 rounded-3xl"
              />
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs uppercase tracking-widest font-black text-kobara-orange mt-6 bg-kobara-orange/10 px-3 py-1 rounded-full border border-kobara-orange/20"
            >
              Abonnement Activé
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black tracking-tight text-white mt-4"
            >
              Félicitations !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 font-medium mt-2 max-w-sm"
            >
              Votre compte marchand Kobara a été mis à niveau avec succès.
            </motion.p>
          </div>

          {/* Premium Subscription Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl">
              <div className="h-1.5 bg-gradient-to-r from-kobara-orange via-kobara-red to-blue-600 w-full" />
              
              <CardContent className="p-8 space-y-6">
                {/* Product/Plan Row */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-kobara-orange border border-white/10 shrink-0">
                      <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-white font-extrabold text-lg">{planName}</h3>
                      <p className="text-xs text-slate-400 font-medium">Facturation mensuelle</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{amount}</span>
                    <span className="text-xs text-slate-400 block font-medium">HTG / mois</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2 text-slate-400 font-semibold">
                      <Receipt className="w-4 h-4 text-slate-400" /> Référence
                    </span>
                    <span className="font-mono text-xs text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      {reference}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2 text-slate-400 font-semibold">
                      <Star className="w-4 h-4 text-slate-400" /> Statut du Plan
                    </span>
                    <span className="text-xs text-emerald-400 font-black flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Actif
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2 text-slate-400 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-slate-400" /> Prochaine facturation
                    </span>
                    <span className="text-white">{nextBilling}</span>
                  </div>
                </div>

                {/* Mini Premium Alert */}
                <div className="bg-gradient-to-r from-blue-500/5 to-kobara-orange/5 border border-white/5 rounded-2xl p-4 flex gap-3.5 items-start">
                  <Sparkles className="w-5 h-5 text-kobara-orange shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Vos limites de transaction mensuelles ont été augmentées et vos frais de transaction Kobara ont été réduits à <span className="text-kobara-orange font-bold">2.5%</span>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-14 px-8 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 font-bold transition-all shadow-xl flex items-center justify-center gap-2 group shrink-0"
              )}
            >
              Aller au Dashboard
              <LayoutDashboard className="w-5 h-5 text-slate-950" />
            </Link>

            {/* Success Dialog Demo trigger */}
            <div className="shrink-0 flex justify-center">
              <SuccessDialog />
            </div>
          </motion.div>

          {/* Secure watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-[10px] text-slate-400 tracking-widest font-black uppercase flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Infrastructure Fintech Sécurisée par Kobara
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PlanSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kobara-orange" />
      </div>
    }>
      <PlanSuccessContent />
    </Suspense>
  );
}
