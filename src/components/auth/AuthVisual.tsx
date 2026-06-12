"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Zap, Server, Lock } from "lucide-react";

export function AuthVisual() {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-12 bg-[#07111F]">
      
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2A38_1px,transparent_1px),linear-gradient(to_bottom,#1E2A38_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF4A1C]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Isometric Scene Container */}
      <div className="relative flex-1 flex items-center justify-center min-h-[500px]">
        
        {/* Core Engine Platform (Isometric) */}
        <div className="relative w-64 h-64" style={{ transform: "rotateX(60deg) rotateZ(-45deg)", transformStyle: "preserve-3d" }}>
          
          {/* Base Platform Glow */}
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-50%] bg-[#FF4A1C]/20 blur-[50px] rounded-full"
            style={{ transform: "translateZ(-50px)" }}
          />

          {/* Glowing Rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              animate={{ rotateZ: 360 }}
              transition={{ duration: 20 + ring * 5, repeat: Infinity, ease: "linear", repeatType: ring % 2 === 0 ? "reverse" : "loop" }}
              className="absolute inset-[-20%] border border-[#FF4A1C]/30 rounded-full"
              style={{ transform: `translateZ(${-20 + ring * 10}px)`, opacity: 0.5 - ring * 0.1 }}
            />
          ))}

          {/* Engine Base */}
          <div className="absolute inset-0 bg-[#020B14] border border-[#FF4A1C]/40 rounded-3xl shadow-[0_0_50px_rgba(255,74,28,0.2)]" style={{ transform: "translateZ(0px)" }}>
            <div className="absolute inset-1 border border-[#1E2A38] rounded-[20px]" />
          </div>

          {/* Engine Middle Layer */}
          <motion.div 
            animate={{ translateZ: [20, 25, 20] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 bg-[#07111F] border border-[#FF4A1C]/60 rounded-2xl shadow-[0_0_30px_rgba(255,74,28,0.3)] backdrop-blur-md"
          />

          {/* Engine Top Layer (Logo) */}
          <motion.div 
            animate={{ translateZ: [40, 50, 40] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute inset-8 bg-[#020B14] border-2 border-[#FF4A1C] rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,74,28,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4A1C]/20 to-transparent" />
            <span className="text-[#FF4A1C] font-black text-6xl" style={{ transform: "rotateZ(45deg) rotateX(-60deg)" }}>K</span>
          </motion.div>

          {/* Data Particles (Outgoing) */}
          {[0, 90, 180, 270].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#FF4A1C] rounded-full shadow-[0_0_10px_#FF4A1C]"
              animate={{
                x: [0, Math.cos((deg * Math.PI) / 180) * 200],
                y: [0, Math.sin((deg * Math.PI) / 180) * 200],
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Floating Element: API Request Window (Top Right) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-10 right-0 lg:right-10 w-[320px] bg-[#020B14]/90 backdrop-blur-xl border border-[#1E2A38] rounded-2xl shadow-2xl overflow-hidden z-20"
        >
          <div className="px-4 py-3 border-b border-[#1E2A38] flex items-center gap-2 bg-[#07111F]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            <span className="text-xs font-mono text-[#AAB3C2] ml-2">API Request</span>
          </div>
          <div className="p-5 font-mono text-[12px] leading-relaxed">
            <div className="text-[#AAB3C2]">
              <span className="text-[#FF4A1C] font-bold">POST</span> /api/v1/payments
            </div>
            <div className="text-white mt-2">{"{"}</div>
            <div className="pl-4">
              <span className="text-[#AAB3C2]">"amount"</span>: <span className="text-[#FF4A1C]">2500</span>,
            </div>
            <div className="pl-4">
              <span className="text-[#AAB3C2]">"currency"</span>: <span className="text-[#27C93F]">"HTG"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[#AAB3C2]">"method"</span>: <span className="text-[#27C93F]">"moncash"</span>
            </div>
            <div className="text-white">{"}"}</div>
            
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-4 pt-3 border-t border-[#1E2A38] text-[#27C93F] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>200 OK - Payment processing...</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Element: Security Module (Top Left) */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-0 lg:left-4 bg-[#020B14]/80 backdrop-blur-md border border-[#FF4A1C]/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_10px_30px_rgba(255,74,28,0.15)] z-20"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FF4A1C]/10 flex items-center justify-center border border-[#FF4A1C]/30 text-[#FF4A1C]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-0.5">Secure Transaction</div>
            <div className="text-xs font-medium text-[#FF4A1C]">MonCash Authenticated</div>
            <div className="w-32 h-1.5 bg-[#1E2A38] rounded-full mt-2 overflow-hidden">
              <motion.div 
                animate={{ width: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#FF4A1C] to-[#FF2E14] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Floating Element: Smartphone Success (Bottom Right) */}
        <motion.div 
          animate={{ y: [10, -10, 10], rotateZ: [5, 2, 5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 lg:right-20 w-[240px] bg-[#020B14] border border-[#1E2A38] rounded-[32px] p-2 shadow-2xl z-30"
        >
          <div className="w-full h-[180px] bg-[#07111F] rounded-[24px] border border-[#1E2A38] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-[80px] h-[20px] bg-[#020B14] rounded-b-xl" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 1, bounce: 0.5 }}
              className="w-16 h-16 rounded-full bg-[#27C93F]/20 flex items-center justify-center mb-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#27C93F] flex items-center justify-center text-[#020B14] shadow-[0_0_20px_rgba(39,201,63,0.5)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </motion.div>
            <div className="text-white font-bold text-lg">Payment Successful</div>
            <div className="text-[#27C93F] font-medium mt-1 text-sm">2,500 HTG</div>
          </div>
        </motion.div>

      </div>

      {/* Marketing & Trust Indicators (Bottom) */}
      <div className="relative z-20 mt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-3">
            Modern <span className="text-[#FF4A1C]">MonCash</span><br />
            Infrastructure For Haiti
          </h2>
          <p className="text-[#AAB3C2] text-sm lg:text-base font-medium max-w-md mx-auto leading-relaxed">
            A developer-first platform designed to handle large-scale mobile money transactions with military-grade security.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-[#1E2A38] pt-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center text-[#FF4A1C] mb-3 shadow-[0_0_15px_rgba(255,74,28,0.1)]">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-[13px] mb-1">Bank-Level Security</h4>
            <p className="text-[#AAB3C2] text-[11px] leading-relaxed hidden xl:block">End-to-end encryption & fraud detection.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center text-[#FF4A1C] mb-3 shadow-[0_0_15px_rgba(255,74,28,0.1)]">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-[13px] mb-1">Real-Time Processing</h4>
            <p className="text-[#AAB3C2] text-[11px] leading-relaxed hidden xl:block">Lightning fast transaction confirmation.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center text-[#FF4A1C] mb-3 shadow-[0_0_15px_rgba(255,74,28,0.1)]">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-[13px] mb-1">99.99% Availability</h4>
            <p className="text-[#AAB3C2] text-[11px] leading-relaxed hidden xl:block">Enterprise-grade infrastructure stability.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
