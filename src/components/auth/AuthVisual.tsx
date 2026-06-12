"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Zap, Server, Lock } from "lucide-react";

export function AuthVisual() {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-12 bg-[#07111F]">
      
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2A38_1px,transparent_1px),linear-gradient(to_bottom,#1E2A38_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4A1C]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Isometric Scene Container */}
      <div className="relative flex-1 flex items-center justify-center min-h-[500px]">
        
        {/* The entire 3D World */}
        <div 
          className="relative w-[500px] h-[500px] flex items-center justify-center" 
          style={{ transform: "rotateX(60deg) rotateZ(-45deg)", transformStyle: "preserve-3d" }}
        >
          
          {/* Base Platform Glow */}
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[10%] bg-[#FF4A1C]/20 blur-[60px] rounded-full"
            style={{ transform: "translateZ(-80px)" }}
          />

          {/* Glowing Ground Rings */}
          {[1, 2, 3, 4].map((ring) => (
            <motion.div
              key={ring}
              animate={{ rotateZ: 360 }}
              transition={{ duration: 30 + ring * 10, repeat: Infinity, ease: "linear", repeatType: ring % 2 === 0 ? "reverse" : "loop" }}
              className="absolute inset-0 border border-[#FF4A1C]/20 rounded-full border-dashed"
              style={{ transform: `translateZ(${-80 + ring * 5}px) scale(${1.2 - ring * 0.15})`, opacity: 0.8 - ring * 0.15 }}
            />
          ))}

          {/* CORE ENGINE */}
          <div className="absolute w-48 h-48 flex items-center justify-center" style={{ transformStyle: "preserve-3d", transform: "translateZ(0px)" }}>
            
            {/* Titanium Base */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A38] to-[#020B14] rounded-3xl shadow-[0_0_50px_rgba(255,74,28,0.3)] border border-[#334155]" style={{ transform: "translateZ(0px)" }}>
              <div className="absolute inset-2 border border-[#FF4A1C]/30 rounded-[20px] bg-[#020B14]/80" />
            </div>

            {/* Glowing Orange Heatsink Layer */}
            <motion.div 
              animate={{ translateZ: [15, 20, 15] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-4 bg-[#FF4A1C]/20 border border-[#FF4A1C] rounded-2xl shadow-[0_0_40px_rgba(255,74,28,0.6)] backdrop-blur-md"
            />

            {/* Middle Processor Unit */}
            <motion.div 
              animate={{ translateZ: [30, 40, 30] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="absolute inset-6 bg-gradient-to-tr from-[#020B14] to-[#1E2A38] border border-[#AAB3C2]/30 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
            </motion.div>

            {/* Top Crystal K Logo */}
            <motion.div 
              animate={{ translateZ: [50, 65, 50] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute inset-10 bg-[#020B14]/90 border-2 border-[#FF4A1C] rounded-lg flex items-center justify-center shadow-[0_0_50px_rgba(255,74,28,0.8)] backdrop-blur-xl"
            >
              <span className="text-[#FF4A1C] font-black text-5xl" style={{ transform: "rotateZ(45deg) rotateX(-60deg)", textShadow: "0 0 20px #FF4A1C" }}>K</span>
            </motion.div>
            
          </div>

          {/* FLOATING ELEMENTS (Now inside the 3D space, closer to the core) */}
          
          {/* API Window (Hovering top right of the core) */}
          <motion.div 
            initial={{ translateZ: 0, opacity: 0 }}
            animate={{ translateZ: [80, 100, 80], opacity: 1 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-20 w-[240px] bg-[#020B14]/80 backdrop-blur-xl border border-[#1E2A38] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="px-3 py-2 border-b border-[#1E2A38] flex items-center gap-1.5 bg-[#07111F]/90">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-[10px] font-mono text-[#AAB3C2] ml-2">API Request</span>
            </div>
            <div className="p-3 font-mono text-[10px] leading-relaxed">
              <div className="text-[#AAB3C2]">
                <span className="text-[#FF4A1C] font-bold">POST</span> /api/v1/payments
              </div>
              <div className="text-white mt-1">{"{"}</div>
              <div className="pl-3">
                <span className="text-[#AAB3C2]">"amount"</span>: <span className="text-[#FF4A1C]">2500</span>,
              </div>
              <div className="pl-3">
                <span className="text-[#AAB3C2]">"currency"</span>: <span className="text-[#27C93F]">"HTG"</span>,
              </div>
              <div className="pl-3">
                <span className="text-[#AAB3C2]">"method"</span>: <span className="text-[#27C93F]">"moncash"</span>
              </div>
              <div className="text-white">{"}"}</div>
              
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-2 pt-2 border-t border-[#1E2A38] text-[#27C93F] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>200 OK - Processing</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Security Module (Hovering top left) */}
          <motion.div 
            animate={{ translateZ: [60, 80, 60] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -top-10 -left-10 bg-[#020B14]/80 backdrop-blur-xl border border-[#FF4A1C]/50 rounded-xl p-3 flex items-center gap-3 shadow-[0_20px_50px_rgba(255,74,28,0.2)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-10 h-10 rounded-lg bg-[#FF4A1C]/10 flex items-center justify-center border border-[#FF4A1C]/40 text-[#FF4A1C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white mb-0.5">Secure Transaction</div>
              <div className="text-[10px] font-medium text-[#FF4A1C]">MonCash Authenticated</div>
              <div className="w-24 h-1 bg-[#1E2A38] rounded-full mt-1.5 overflow-hidden">
                <motion.div 
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#FF4A1C] to-[#FF2E14] rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Smartphone Success Mockup (Hovering bottom) */}
          <motion.div 
            animate={{ translateZ: [90, 110, 90] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-20 right-0 w-[180px] bg-[#1E2A38] border-2 border-[#334155] rounded-[24px] p-1.5 shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-full h-[140px] bg-[#020B14] rounded-[18px] flex flex-col items-center justify-center relative overflow-hidden border border-[#000]">
              <div className="absolute top-0 w-[60px] h-[12px] bg-[#1E2A38] rounded-b-lg z-10" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-[#27C93F]/10 to-transparent" />

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 1.5, bounce: 0.5 }}
                className="w-12 h-12 rounded-full bg-[#27C93F]/20 flex items-center justify-center mb-2 mt-4"
              >
                <div className="w-8 h-8 rounded-full bg-[#27C93F] flex items-center justify-center text-[#020B14] shadow-[0_0_20px_rgba(39,201,63,0.6)]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </motion.div>
              <div className="text-white font-bold text-[13px] relative z-10">Payment Successful</div>
              <div className="text-[#27C93F] font-bold mt-0.5 text-[11px] relative z-10">2,500 HTG</div>
            </div>
          </motion.div>

          {/* 3D Data Particles flowing between elements */}
          {[
            { start: { x: 0, y: 0, z: 50 }, end: { x: -60, y: -60, z: 80 } }, // Core -> API
            { start: { x: -60, y: -60, z: 80 }, end: { x: -40, y: -40, z: 60 } }, // API -> Security
            { start: { x: -40, y: -40, z: 60 }, end: { x: 0, y: 80, z: 90 } }, // Security -> Phone
          ].map((path, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full bg-[#FF4A1C] shadow-[0_0_15px_#FF4A1C]"
              animate={{
                x: [path.start.x, path.end.x],
                y: [path.start.y, path.end.y],
                z: [path.start.z, path.end.z],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              style={{ transformStyle: "preserve-3d" }}
            />
          ))}

        </div>
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
