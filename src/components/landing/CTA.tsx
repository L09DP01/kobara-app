"use client";

import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 bg-[#020B14] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative bg-[#07111F] rounded-3xl border border-[#1E2A38] p-10 md:p-16 text-center shadow-2xl overflow-hidden group"
        >
          {/* Animated Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] max-h-[500px] bg-[#FF4A1C]/20 rounded-full blur-[100px] group-hover:bg-[#FF4A1C]/30 transition-colors duration-700 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center mb-8 shadow-lg">
              <Rocket className="w-8 h-8 text-[#FF4A1C]" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-2xl">
              Ready to grow your business with <span className="text-[#FF4A1C]">Kobara</span>?
            </h2>
            
            <p className="text-[#AAB3C2] text-lg md:text-xl mb-10 max-w-xl">
              Join businesses in Haiti already accepting MonCash payments online.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#FF4A1C] hover:bg-[#FF2E14] text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,74,28,0.4)] hover:shadow-[0_0_40px_rgba(255,74,28,0.6)] w-full sm:w-auto"
            >
              Create Your Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="mt-4 text-[#AAB3C2] text-sm">
              No credit card required
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
