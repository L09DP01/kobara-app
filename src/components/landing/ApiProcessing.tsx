"use client";

import { motion } from "framer-motion";
import { Server, CheckCircle2 } from "lucide-react";

export function ApiProcessing() {
  return (
    <section className="py-24 bg-[#020B14] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,42,56,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,42,56,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      
      {/* Large Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF4A1C]/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-bold text-[#FF4A1C] tracking-widest uppercase mb-4">
            API-FIRST INFRASTRUCTURE
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Developer-friendly <br className="hidden md:block"/> payment processing.
          </h2>
          <p className="text-[#AAB3C2] text-lg">
            Your backend sends the request, Kobara handles MonCash securely, and your frontend receives real-time payment status via webhooks.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10 items-center">
          
          {/* Left Block - Realistic IDE (Backend) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-[#07111F] rounded-2xl border border-[#1E2A38] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col"
          >
            {/* IDE Header */}
            <div className="flex items-center px-4 py-3 bg-[#020B14] border-b border-[#1E2A38]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto flex items-center gap-2 px-3 py-1 bg-[#07111F] rounded-md border border-[#1E2A38] text-xs text-[#AAB3C2] font-mono">
                <span className="text-yellow-400">TS</span> payment.ts
              </div>
            </div>

            {/* IDE Code */}
            <div className="p-5 overflow-x-auto">
              <pre className="text-[13px] leading-relaxed font-mono text-gray-300">
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">1</span>
                  <span><span className="text-purple-400">import</span> {`{`} Kobara {`}`} <span className="text-purple-400">from</span> <span className="text-green-400">'@kobara/node'</span>;</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">2</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">3</span>
                  <span><span className="text-purple-400">const</span> kobara = <span className="text-purple-400">new</span> <span className="text-yellow-200">Kobara</span>(<span className="text-blue-300">process.env.</span><span className="text-white">KOBARA_KEY</span>);</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">4</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">5</span>
                  <span><span className="text-purple-400">const</span> <span className="text-blue-400">createPayment</span> = <span className="text-purple-400">async</span> () {`=>`} {`{`}</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">6</span>
                  <span>  <span className="text-purple-400">const</span> payment = <span className="text-purple-400">await</span> kobara.payments.<span className="text-blue-400">create</span>({`{`}</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">7</span>
                  <span>    <span className="text-blue-200">amount</span>: <span className="text-orange-400">2500</span>,</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">8</span>
                  <span>    <span className="text-blue-200">currency</span>: <span className="text-green-400">"HTG"</span>,</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">9</span>
                  <span>    <span className="text-blue-200">method</span>: <span className="text-green-400">"moncash"</span>,</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">10</span>
                  <span>    <span className="text-blue-200">customer</span>: {`{`}</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">11</span>
                  <span>      <span className="text-blue-200">phone</span>: <span className="text-green-400">"+509XXXXXXXX"</span></span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">12</span>
                  <span>    {`}`}</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">13</span>
                  <span>  {`}`});</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">14</span>
                  <span>  <span className="text-purple-400">return</span> payment;</span>
                </div>
                <div className="flex">
                  <span className="text-[#475569] mr-4 select-none">15</span>
                  <span>{`}`};</span>
                </div>
              </pre>
            </div>
          </motion.div>

          {/* Center Block - Realistic Kobara API Gateway */}
          <div className="relative flex flex-col items-center justify-center py-16">
            
            {/* Animated Data Stream from Left */}
            <div className="absolute left-[-30%] lg:left-[-20%] top-1/2 -translate-y-1/2 w-32 h-[2px] bg-[#1E2A38] hidden lg:block overflow-hidden">
               <motion.div 
                  className="w-1/2 h-full bg-[#FF4A1C] shadow-[0_0_10px_#FF4A1C]"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
            </div>

            {/* Glowing API Core */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-20"
            >
              <div className="w-32 h-32 relative flex items-center justify-center">
                {/* Outer Rotating Rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-[-20px] rounded-full border border-dashed border-[#FF4A1C]/30"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-[-10px] rounded-full border border-dotted border-[#FF4A1C]/50"
                />
                
                {/* Core Hexagon / Server */}
                <div className="w-full h-full bg-gradient-to-br from-[#1E2A38] to-[#020B14] rounded-2xl border border-[#FF4A1C]/40 shadow-[0_0_50px_rgba(255,74,28,0.2),inset_0_0_20px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center relative overflow-hidden transform rotate-45">
                   <div className="absolute inset-0 bg-gradient-to-t from-[#FF4A1C]/20 to-transparent" />
                   <div className="transform -rotate-45 flex flex-col items-center">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src="/Icone.png" alt="Kobara Core" className="w-10 h-10 object-contain mb-2 filter drop-shadow-[0_0_10px_rgba(255,74,28,0.8)]" />
                     <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75" />
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-150" />
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
            
            <div className="mt-8 flex flex-col items-center">
              <span className="text-white font-bold text-sm">Kobara API</span>
              <span className="text-[#AAB3C2] font-mono text-xs mt-1">Status: Operational</span>
            </div>

            {/* Animated Data Stream to Right */}
            <div className="absolute right-[-30%] lg:right-[-20%] top-1/2 -translate-y-1/2 w-32 h-[2px] bg-[#1E2A38] hidden lg:block overflow-hidden">
               <motion.div 
                  className="w-1/2 h-full bg-[#FF4A1C] shadow-[0_0_10px_#FF4A1C]"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.75 }}
               />
            </div>
          </div>

          {/* Right Block - Realistic Push Notification / Webhook Result */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            {/* Webhook Header Mock */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#07111F] border border-[#1E2A38] rounded-full self-start shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[#AAB3C2] font-mono">POST /webhook 200 OK</span>
            </div>

            {/* Success Card Mockup */}
            <div className="bg-gradient-to-b from-[#1E2A38]/50 to-[#020B14] rounded-2xl border border-[#1E2A38] p-1 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
              
              <div className="bg-[#07111F] rounded-xl p-6 relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Payment Received</h3>
                      <p className="text-[#AAB3C2] text-xs">Just now</p>
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Icone.png" alt="Kobara" className="w-5 h-5 opacity-50 grayscale" />
                </div>

                <div className="p-4 bg-[#020B14] rounded-lg border border-[#1E2A38] mb-4">
                  <div className="text-3xl font-bold text-white mb-1">2,500 <span className="text-lg text-[#AAB3C2] font-medium">HTG</span></div>
                  <div className="text-[#AAB3C2] text-sm">from +509 XX XXX XXX</div>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full flex justify-between text-xs">
                    <span className="text-[#AAB3C2]">Method</span>
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 flex items-center justify-center text-[6px] font-bold">M</span>
                      MonCash
                    </span>
                  </div>
                  <div className="w-full flex justify-between text-xs">
                    <span className="text-[#AAB3C2]">Transaction ID</span>
                    <span className="text-white font-mono">KB-2039</span>
                  </div>
                  <div className="w-full flex justify-between text-xs">
                    <span className="text-[#AAB3C2]">Status</span>
                    <span className="text-green-500 font-medium">Succeeded</span>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
