"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/context/LanguageContext";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#020B14]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-[#FF4A1C]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left mt-8 md:mt-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07111F] border border-[#1E2A38] text-xs md:text-sm text-[#AAB3C2] mb-6 md:mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FF4A1C] animate-pulse" />
              {t("home.heroBadge") || "Version 1.0"}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-4 md:mb-6 tracking-tight">
              {t("home.heroTitle1") || "Simplifiez vos" } <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A1C] to-[#FF2E14]">
                {t("home.heroTitle2") || "Paiements"}
              </span><br className="hidden sm:block" />
              {t("home.heroTitle3") || "en Haïti"}
            </h1>

            <p className="text-base md:text-lg text-[#AAB3C2] mb-8 md:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t("home.heroDesc") || "Acceptez MonCash facilement."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 md:mb-12">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF4A1C] hover:bg-[#FF2E14] text-white font-semibold transition-all shadow-[0_0_20px_rgba(255,74,28,0.3)] hover:shadow-[0_0_30px_rgba(255,74,28,0.5)] flex items-center justify-center gap-2 group min-h-[44px]"
              >
                {t("home.getStarted") || "Commencer"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-[#1E2A38] hover:border-[#AAB3C2] text-white font-semibold transition-colors flex items-center justify-center min-h-[44px]"
              >
                {t("home.viewDocs") || "Documentation"}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-6 text-[#AAB3C2] text-xs md:text-sm font-medium items-center justify-center lg:justify-start">
              {['No setup fee', 'No monthly fee', 'Secure & Reliable'].map((benefit, i) => (
                <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#FF4A1C]" />
                  {benefit}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Isometric Visual (Responsive on all screens) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="flex relative h-[350px] sm:h-[450px] lg:h-[600px] items-center justify-center perspective-[800px] sm:perspective-[1000px] lg:perspective-[1200px] mt-8 lg:mt-0 w-full overflow-visible"
          >
            {/* 3D Container */}
            <div className="relative w-[320px] h-[640px] transform-gpu rotate-x-[20deg] rotate-y-[-25deg] rotate-z-[5deg] hover:rotate-x-[15deg] hover:rotate-y-[-15deg] transition-transform duration-700 ease-out preserve-3d scale-[0.6] sm:scale-[0.75] lg:scale-100 origin-center">
              
              {/* Base Platform Shadow (Deeper, more realistic) */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[300px] h-[40px] bg-black/60 blur-[30px] rounded-[100%] translate-z-[-50px]" />
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[450px] h-[120px] bg-[#FF4A1C]/20 blur-[60px] rounded-[100%] translate-z-[-100px]" />

              {/* Smartphone Body */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A38] to-[#020B14] rounded-[3.5rem] border-[6px] border-[#07111F] shadow-[20px_20px_60px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col translate-z-0">
                
                {/* Screen Reflection (Glass effect) */}
                <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[50%] bg-gradient-to-b from-white/5 to-transparent rotate-12 pointer-events-none z-50" />
                
                {/* Dynamic Island / Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-40 shadow-[inset_0_-2px_5px_rgba(255,255,255,0.1)]" />
                
                {/* Phone Screen Background */}
                <div className="flex-1 bg-gradient-to-b from-[#0A1628] to-[#020B14] pt-24 px-6 flex flex-col items-center relative z-10">
                  
                  {/* Glowing Grid Background inside screen */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(30,42,56,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,42,56,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                  {/* Payment Info */}
                  <div className="w-full bg-[#07111F]/80 backdrop-blur-md border border-[#1E2A38] rounded-2xl p-5 mb-8 shadow-lg relative z-20">
                    <div className="text-[#AAB3C2] text-xs uppercase tracking-wider mb-3">Amount Due</div>
                    <div className="text-4xl font-bold text-white mb-1">2,500.00</div>
                    <div className="text-[#AAB3C2] text-sm mb-4">HTG</div>
                    <div className="w-full h-px bg-[#1E2A38] mb-4" />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#AAB3C2]">Merchant</span>
                      <span className="text-white font-medium">Kobara Store</span>
                    </div>
                  </div>

                  {/* Success Animation Container */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF4A1C] to-[#FF2E14] flex items-center justify-center shadow-[0_0_40px_rgba(255,74,28,0.4),inset_0_5px_15px_rgba(255,255,255,0.2)] mb-6 relative z-20"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </motion.div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-center relative z-20"
                  >
                    <div className="text-white font-bold text-xl mb-1">Payment Successful</div>
                    <div className="text-[#AAB3C2] text-sm">Transaction #KB-2039</div>
                  </motion.div>

                  {/* Bottom Home Indicator */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-20" />
                </div>
              </div>

              {/* Floating Cards (Realistic Isometric with depth) */}
              
              {/* Floating Kobara Card */}
              <motion.div
                animate={{ y: [-15, 15, -15] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute -right-20 top-[20%] w-40 p-4 bg-[#07111F]/90 backdrop-blur-xl border border-[#1E2A38] rounded-2xl shadow-[20px_20px_40px_rgba(0,0,0,0.6)] translate-z-[50px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF4A1C] flex items-center justify-center font-bold text-white shadow-lg">K</div>
                  <span className="text-white font-bold text-sm">API Call</span>
                </div>
                <div className="h-2 w-full bg-[#1E2A38] rounded-full mb-2" />
                <div className="h-2 w-3/4 bg-[#1E2A38] rounded-full" />
              </motion.div>

              {/* Floating MonCash Card */}
              <motion.div
                animate={{ y: [15, -15, 15] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -left-20 bottom-[25%] w-44 p-4 bg-gradient-to-br from-red-600 to-red-700 border border-red-500/50 rounded-2xl shadow-[20px_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(220,38,38,0.2)] translate-z-[80px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-600 font-bold text-sm shadow-inner">M</div>
                  <div>
                    <div className="text-white font-bold text-sm">MonCash</div>
                    <div className="text-red-200 text-xs">Authorized</div>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
