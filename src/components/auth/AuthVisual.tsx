"use client";

import { motion } from "framer-motion";
import { CreditCard, Database, Lock, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

export function AuthVisual() {
  return (
    <div className="relative w-full h-full bg-[#0B101E] overflow-hidden flex flex-col justify-center">
      {/* Background gradients and blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-kobara-red/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-kobara-orange/10 blur-[150px] rounded-full mix-blend-screen" />
      
      {/* Grid overlay for tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-center p-16">
        
        {/* Top Section - Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-12 left-12 flex items-center gap-3"
        >
          <div className="bg-white rounded-xl shadow-lg shadow-white/5 flex items-center justify-center w-10 h-10 p-1">
            <Image src="/Icone.png" alt="Kobara Logo" width={32} height={32} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Kobara</span>
        </motion.div>

        {/* Center Content - Abstract Nodes & Code */}
        <div className="flex-1 flex flex-col justify-center relative min-h-[400px] max-w-lg mx-auto w-full scale-90 lg:scale-100">
          
          {/* Animated Code Terminal */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -right-12 top-[45%] w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 z-20"
          >
            <div className="flex gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500/80" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
              <div className="w-2 h-2 rounded-full bg-green-500/80" />
            </div>
            <div className="font-mono text-[10px] sm:text-xs text-white/70 space-y-2">
              <p><span className="text-kobara-red">POST</span> /api/v1/payments</p>
              <p className="text-white/40">{"{"}</p>
              <p className="pl-4">"amount": <span className="text-kobara-orange">1500</span>,</p>
              <p className="pl-4">"currency": <span className="text-green-400">"HTG"</span>,</p>
              <p className="pl-4">"method": <span className="text-green-400">"moncash"</span></p>
              <p className="text-white/40">{"}"}</p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
                className="text-emerald-400 pt-2"
              >
                {">"} 200 OK - Payment processing...
              </motion.p>
            </div>
          </motion.div>

          {/* Floating Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute -left-12 top-[15%] w-60 bg-gradient-to-br from-kobara-red to-kobara-orange p-[1px] rounded-2xl z-10 shadow-2xl shadow-kobara-red/20"
          >
            <div className="bg-[#0f172a] rounded-2xl p-4 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="text-white w-4 h-4" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">Secure Transaction</div>
                  <div className="text-white/50 text-[10px]">MonCash Authenticated</div>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-gradient-to-r from-kobara-red to-kobara-orange"
                />
              </div>
            </div>
          </motion.div>

          {/* Central graphic */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px]">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="w-full h-full rounded-full border border-white/5 border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-white/10"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-kobara-primary to-black rounded-full border border-white/10 shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)] flex items-center justify-center">
                <Zap className="text-white w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section - Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative z-20 mt-12 text-center"
        >
          <h2 className="text-[2.5rem] font-black tracking-tighter leading-[1.1] mb-4">
            <span className="text-white">Modern </span>
            <span className="text-kobara-red">MonCash</span>
            <br />
            <span className="text-white">Infrastructure For Haiti</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            A developer-first platform designed to handle large-scale mobile money transactions with military-grade security.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
