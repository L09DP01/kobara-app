"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsometricVisual } from "./IsometricVisual";

export function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="glass-panel rounded-[3rem] p-10 lg:p-20 border-white/60 shadow-2xl relative overflow-hidden bg-white/40">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8 z-10"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-white/80 shadow-sm text-sm font-bold text-kobara-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                MonCash API v2 is live
              </div>

              <h1 className="text-5xl lg:text-[4.5rem] leading-[1.05] font-extrabold text-kobara-primary tracking-tight">
                MonCash Payments Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-kobara-red to-kobara-orange">Simple</span> For Digital Businesses.
              </h1>

              <p className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
                A modern, developer-first infrastructure to integrate, automate, and scale MonCash payments effortlessly across your platforms.
              </p>

              <div className="flex flex-wrap items-center gap-5 pt-4">
                <Button className="h-14 px-10 rounded-2xl bg-kobara-primary hover:bg-black text-white text-lg font-bold shadow-2xl shadow-kobara-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="h-14 px-10 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white/50 text-slate-900 text-lg font-bold transition-all hover:bg-white flex items-center gap-3">
                  <Terminal className="w-5 h-5" />
                  View Docs
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-10 pt-12 border-t border-slate-200/60">
                <div>
                  <div className="text-3xl font-extrabold text-kobara-primary tracking-tight">HTG 12M+</div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Processed</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div>
                  <div className="text-3xl font-extrabold text-kobara-primary tracking-tight">1,200+</div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">API Requests</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-200" />
                <div>
                  <div className="text-3xl font-extrabold text-kobara-primary tracking-tight">99.9%</div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Uptime</div>
                </div>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative min-h-[400px] lg:min-h-[600px]"
            >
              <IsometricVisual />
            </motion.div>
          </div>

          {/* Decorative Corner Backgrounds */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-kobara-orange/10 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-kobara-red/5 rounded-full blur-[120px] -z-10" />
        </div>
      </div>
    </section>
  );
}
