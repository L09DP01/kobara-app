"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3.5rem] bg-slate-900 overflow-hidden p-12 lg:p-24 text-center border border-white/10 shadow-[0_40px_100px_rgba(11,19,36,0.3)]"
        >
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kobara-red/20 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-kobara-orange/20 rounded-full blur-[120px] -z-0 -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-kobara-orange" />
              Ready to scale?
            </div>

            <h3 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Start accepting MonCash payments with Kobara.
            </h3>

            <p className="text-lg lg:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Join hundreds of digital businesses in Haiti and automate your payment infrastructure today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <Button asChild className="h-16 px-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-lg font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                <Link href="/register">
                  Create Account 
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-12 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 text-lg font-bold transition-all flex items-center gap-3">
                <Link href="/docs">Read Docs</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
