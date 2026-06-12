"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Zap, Server, Lock, Wifi } from "lucide-react";

export function AuthVisual() {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-8 xl:p-12 bg-[#07111F]">
      
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2A38_1px,transparent_1px),linear-gradient(to_bottom,#1E2A38_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF4A1C]/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Scene Container */}
      <div className="relative flex-1 flex items-center justify-center">
        
        {/* ==================== */}
        {/* ISOMETRIC CORE ENGINE (Only the engine is in 3D) */}
        {/* ==================== */}
        <div className="relative flex items-center justify-center">
          
          {/* Isometric Platform */}
          <div 
            className="relative w-56 h-56 xl:w-64 xl:h-64" 
            style={{ transform: "rotateX(60deg) rotateZ(-45deg)", transformStyle: "preserve-3d" }}
          >
            {/* Ground Glow */}
            <motion.div 
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[-30%] bg-[#FF4A1C]/15 blur-[50px] rounded-full"
              style={{ transform: "translateZ(-60px)" }}
            />

            {/* Rotating Orbit Rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                animate={{ rotateZ: 360 }}
                transition={{ duration: 25 + ring * 8, repeat: Infinity, ease: "linear", repeatType: ring % 2 === 0 ? "reverse" : "loop" }}
                className="absolute rounded-full border border-dashed"
                style={{ 
                  inset: `${-15 - ring * 12}%`,
                  borderColor: `rgba(255,74,28,${0.25 - ring * 0.05})`,
                  transform: `translateZ(${-40 + ring * 8}px)`,
                }}
              />
            ))}

            {/* Base Layer (Titanium) */}
            <div 
              className="absolute inset-0 rounded-3xl border border-[#334155] shadow-[0_0_60px_rgba(255,74,28,0.25)]"
              style={{ 
                transform: "translateZ(0px)",
                background: "linear-gradient(135deg, #1a2332 0%, #0a1220 50%, #020B14 100%)"
              }}
            >
              <div className="absolute inset-[6px] border border-[#FF4A1C]/20 rounded-[20px]" />
              {/* Circuit pattern */}
              <div className="absolute inset-3 opacity-10 bg-[linear-gradient(0deg,transparent_48%,#FF4A1C_49%,#FF4A1C_51%,transparent_52%),linear-gradient(90deg,transparent_48%,#FF4A1C_49%,#FF4A1C_51%,transparent_52%)] bg-[size:16px_16px]" />
            </div>

            {/* Orange Heatsink Layer */}
            <motion.div 
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-3 rounded-2xl border border-[#FF4A1C]/80 shadow-[0_0_30px_rgba(255,74,28,0.5),inset_0_0_20px_rgba(255,74,28,0.15)]"
              style={{ 
                transform: "translateZ(15px)",
                background: "linear-gradient(135deg, rgba(255,74,28,0.15), rgba(255,74,28,0.05))"
              }}
            />

            {/* Processor Unit */}
            <motion.div 
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              className="absolute inset-6 rounded-xl border border-[#AAB3C2]/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
              style={{ 
                transform: "translateZ(30px)",
                background: "linear-gradient(135deg, #1a2332, #0d1a28)"
              }}
            >
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.08)_50%,transparent_75%)] bg-[length:12px_12px]" />
            </motion.div>

            {/* Top Crystal — K Logo */}
            <motion.div 
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-10 rounded-lg border-2 border-[#FF4A1C] flex items-center justify-center shadow-[0_0_50px_rgba(255,74,28,0.7),0_0_100px_rgba(255,74,28,0.3)] overflow-hidden"
              style={{ 
                transform: "translateZ(45px)",
                background: "linear-gradient(135deg, #020B14, #0a1628)"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4A1C]/25 to-transparent" />
              <span 
                className="text-[#FF4A1C] font-black text-5xl xl:text-6xl relative z-10 drop-shadow-[0_0_15px_rgba(255,74,28,0.8)]" 
                style={{ transform: "rotateZ(45deg) rotateX(-60deg)" }}
              >
                K
              </span>
            </motion.div>

            {/* Particle Emissions from corners */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`emit-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#FF4A1C] shadow-[0_0_12px_#FF4A1C]"
                style={{ 
                  top: i < 2 ? "10%" : "90%",
                  left: i % 2 === 0 ? "10%" : "90%",
                  transform: "translateZ(50px)"
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                  y: [0, -30, -60],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* ==================== */}
        {/* FLOATING CARDS (Outside isometric, normal 2D, positioned around engine) */}
        {/* ==================== */}

        {/* Security Module — Top Left */}
        <motion.div 
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] xl:left-[8%] bg-[#020B14]/90 backdrop-blur-xl border border-[#FF4A1C]/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-20"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FF4A1C]/10 flex items-center justify-center border border-[#FF4A1C]/40 text-[#FF4A1C]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Secure Transaction</div>
            <div className="text-xs font-semibold text-[#FF4A1C] mt-0.5">MonCash Authenticated</div>
            <div className="w-28 h-1.5 bg-[#1E2A38] rounded-full mt-2 overflow-hidden">
              <motion.div 
                animate={{ width: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#FF4A1C] to-[#FF2E14] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* API Request Window — Top Right */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: [-5, 5, -5], opacity: 1 }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-[3%] xl:right-[5%] w-[280px] xl:w-[300px] bg-[#020B14]/95 backdrop-blur-xl border border-[#1E2A38] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-20"
        >
          <div className="px-4 py-2.5 border-b border-[#1E2A38] flex items-center gap-2 bg-[#07111F]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            <span className="text-[11px] font-mono text-[#AAB3C2] ml-2">API Request</span>
          </div>
          <div className="p-4 font-mono text-[11px] xl:text-[12px] leading-relaxed">
            <div className="text-[#AAB3C2]">
              <span className="text-[#FF4A1C] font-bold">POST</span> /api/v1/payments
            </div>
            <div className="text-white mt-2">{"{"}</div>
            <div className="pl-4">
              <span className="text-[#AAB3C2]">&quot;amount&quot;</span>: <span className="text-[#FF4A1C]">2500</span>,
            </div>
            <div className="pl-4">
              <span className="text-[#AAB3C2]">&quot;currency&quot;</span>: <span className="text-[#27C93F]">&quot;HTG&quot;</span>,
            </div>
            <div className="pl-4">
              <span className="text-[#AAB3C2]">&quot;method&quot;</span>: <span className="text-[#27C93F]">&quot;moncash&quot;</span>
            </div>
            <div className="text-white">{"}"}</div>
            
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="mt-3 pt-3 border-t border-[#1E2A38] text-[#27C93F] flex items-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>200 OK — Payment processing...</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Smartphone Success — Bottom Right */}
        <motion.div 
          animate={{ y: [8, -8, 8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[12%] right-[8%] xl:right-[12%] w-[200px] bg-[#1a2332] border-2 border-[#334155] rounded-[28px] p-2 shadow-[0_30px_60px_rgba(0,0,0,0.7)] z-20"
        >
          <div className="w-full h-[160px] bg-[#020B14] rounded-[20px] flex flex-col items-center justify-center relative overflow-hidden border border-[#0a1220]">
            {/* Notch */}
            <div className="absolute top-0 w-[60px] h-[16px] bg-[#1a2332] rounded-b-xl z-10" />
            
            <div className="absolute inset-0 bg-gradient-to-b from-[#27C93F]/8 to-transparent" />

            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 1.5, bounce: 0.5 }}
              className="w-14 h-14 rounded-full bg-[#27C93F]/15 flex items-center justify-center mb-2 mt-4"
            >
              <div className="w-9 h-9 rounded-full bg-[#27C93F] flex items-center justify-center text-[#020B14] shadow-[0_0_25px_rgba(39,201,63,0.5)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </motion.div>
            <div className="text-white font-bold text-sm relative z-10">Payment Successful</div>
            <div className="text-[#27C93F] font-bold mt-1 text-xs relative z-10">2,500 HTG</div>
          </div>
        </motion.div>

        {/* Webhook Notification — Bottom Left */}
        <motion.div 
          animate={{ y: [5, -10, 5], x: [-3, 3, -3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] left-[5%] xl:left-[8%] bg-[#020B14]/90 backdrop-blur-xl border border-[#1E2A38] rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF4A1C]/10 flex items-center justify-center border border-[#FF4A1C]/30 text-[#FF4A1C]">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Webhook Received</div>
              <div className="text-[10px] text-[#AAB3C2] mt-0.5">payment.succeeded</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#27C93F] shadow-[0_0_8px_rgba(39,201,63,0.6)]" 
            />
            <span className="text-[11px] text-[#27C93F] font-semibold">Delivered — 200ms</span>
          </div>
        </motion.div>

        {/* Connection Lines (Decorative SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30" viewBox="0 0 800 600" fill="none">
          <motion.path
            d="M200 120 Q400 200 400 300"
            stroke="#FF4A1C"
            strokeWidth="1"
            strokeDasharray="6 6"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M600 120 Q400 200 400 300"
            stroke="#FF4A1C"
            strokeWidth="1"
            strokeDasharray="6 6"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
          />
          <motion.path
            d="M400 300 Q500 400 600 450"
            stroke="#27C93F"
            strokeWidth="1"
            strokeDasharray="6 6"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
          />
          <motion.path
            d="M400 300 Q300 400 200 470"
            stroke="#27C93F"
            strokeWidth="1"
            strokeDasharray="6 6"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
          />
        </svg>

      </div>

      {/* Marketing & Trust Indicators (Bottom) */}
      <div className="relative z-20 mt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl xl:text-4xl font-black text-white tracking-tighter mb-3">
            Modern <span className="text-[#FF4A1C]">MonCash</span><br />
            Infrastructure For Haiti
          </h2>
          <p className="text-[#AAB3C2] text-sm font-medium max-w-md mx-auto leading-relaxed">
            A developer-first platform designed to handle large-scale mobile money transactions with military-grade security.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 xl:gap-4 border-t border-[#1E2A38] pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center text-[#FF4A1C] mb-2 shadow-[0_0_15px_rgba(255,74,28,0.1)]">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-[12px] xl:text-[13px] mb-0.5">Sécurisé</h4>
            <p className="text-[#AAB3C2] text-[10px] xl:text-[11px] leading-relaxed">Protection de niveau bancaire</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center text-[#FF4A1C] mb-2 shadow-[0_0_15px_rgba(255,74,28,0.1)]">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-[12px] xl:text-[13px] mb-0.5">Rapide</h4>
            <p className="text-[#AAB3C2] text-[10px] xl:text-[11px] leading-relaxed">Transactions en temps réel</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center text-[#FF4A1C] mb-2 shadow-[0_0_15px_rgba(255,74,28,0.1)]">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-[12px] xl:text-[13px] mb-0.5">Fiable</h4>
            <p className="text-[#AAB3C2] text-[10px] xl:text-[11px] leading-relaxed">Disponibilité et stabilité 24/7</p>
          </div>
        </div>
      </div>

    </div>
  );
}
