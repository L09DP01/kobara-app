"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Shield, Zap, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";

export function Hero() {
  const { t, language } = useTranslation();

  return (
    <section className="relative w-full flex flex-col min-h-[600px] lg:min-h-0" style={{ height: 'auto' }}>
      {/* Outer padding — thin margin on all sides, below the 80px navbar */}
      <div className="flex-1 px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col lg:h-[calc(100vh/0.67)]" style={{ paddingTop: "84px" }}>
        {/*
          Main hero card — fills remaining space.
          On mobile: stacked column. On desktop: two columns side by side.
          Both halves share the SAME white/glass background for visual unity.
        */}
        <div className="flex-1 rounded-[24px] sm:rounded-[28px] overflow-hidden relative bg-white/65 backdrop-blur-md border border-white/90 shadow-[0_20px_60px_rgba(7,20,43,0.07)] flex flex-col lg:flex-row">

          {/* ── Left column: text content ── */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left lg:w-[52%] px-4 sm:px-10 lg:pl-16 lg:pr-8 py-8 lg:py-12 z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-5 lg:space-y-7 flex flex-col items-center lg:items-start w-full"
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-sm font-bold text-kobara-red">
                {t("home.heroBadge")}
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-[4.2rem] leading-[1.06] font-black text-kobara-primary tracking-tighter">
                {language === "fr" ? (
                  <>
                    La Passerelle de Paiement<br />
                    Pour Entreprises et<br />
                    Développeurs<span className="text-kobara-red">.</span>
                  </>
                ) : (
                  <>
                    The Payment Gateway API<br />
                    For Businesses And<br />
                    Developers<span className="text-kobara-red">.</span>
                  </>
                )}
              </h1>

              {/* Subtext */}
              <h2 className="text-sm sm:text-base xl:text-lg text-kobara-secondary max-w-[460px] leading-relaxed font-medium mx-auto lg:mx-0">
                {language === "fr"
                  ? "La meilleure API de paiement en Haïti. Intégrez facilement notre passerelle sur votre site web pour accepter MonCash. Créez des liens de paiement et automatisez vos encaissements."
                  : "The best payment gateway API in Haiti. Easily integrate our gateway into your website to accept MonCash. Create payment links in seconds and automate your payouts."}
              </h2>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 w-full">
                <Link
                  href="/register"
                  className="h-12 sm:h-14 px-7 sm:px-9 rounded-xl bg-kobara-primary hover:bg-slate-900 text-white text-[15px] sm:text-[16px] font-bold shadow-xl shadow-kobara-primary/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5"
                >
                  {t("home.getStarted")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/developers"
                  className="h-12 sm:h-14 px-7 sm:px-9 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm text-kobara-primary text-[15px] sm:text-[16px] font-bold transition-all hover:bg-white flex items-center gap-2.5"
                >
                  <BookOpen className="w-4 h-4" />
                  {t("home.viewDocs")}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 pt-1 w-full">
                <div className="flex items-center gap-3 bg-white/80 border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 flex items-center justify-center text-kobara-red shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[16px] sm:text-[18px] font-black text-kobara-primary tracking-tight leading-none">HTG 12M+</div>
                    <div className="text-[11px] sm:text-[12px] text-kobara-secondary font-semibold mt-0.5">
                      {language === "fr" ? "Traité" : "Processed"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/80 border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[16px] sm:text-[18px] font-black text-kobara-primary tracking-tight leading-none">1,200+</div>
                    <div className="text-[11px] sm:text-[12px] text-kobara-secondary font-semibold mt-0.5">
                      {language === "fr" ? "Requêtes API" : "API Requests"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/80 border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 flex items-center justify-center text-kobara-orange shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[16px] sm:text-[18px] font-black text-kobara-primary tracking-tight leading-none">99.9%</div>
                    <div className="text-[11px] sm:text-[12px] text-kobara-secondary font-semibold mt-0.5">Uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/*
            ── Right column: isometric visual ──
            Background is TRANSPARENT so it inherits the same white/glass
            background as the whole card — unified look as requested.
            A very subtle radial tint adds depth without a hard color split.
          */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 relative overflow-hidden hidden lg:flex items-center justify-center min-h-[280px]"
            style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(249,241,241,0.9) 0%, rgba(245,247,250,0.4) 100%)' }}
          >
            {/* Isometric image — aggressive radial mask fades all edges into bg */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div
                className="relative w-[88%] h-[88%]"
                style={{
                  maskImage: 'radial-gradient(ellipse 75% 72% at 50% 50%, black 20%, rgba(0,0,0,0.7) 45%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 75% 72% at 50% 50%, black 20%, rgba(0,0,0,0.7) 45%, transparent 75%)',
                }}
              >
                <Image
                  src="/images/isometric.png"
                  alt="Kobara API Infrastructure"
                  fill
                  className="object-contain"
                  style={{ mixBlendMode: "multiply" }}
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

