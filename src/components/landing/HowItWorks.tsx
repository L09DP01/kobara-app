"use client";

import { motion } from "framer-motion";
import { User, Server, ShieldCheck, Smartphone, Database, Layout } from "lucide-react";

const steps = [
  { id: 1, label: "create a account", icon: User, desc: "Sign up and configure" },
  { id: 2, label: "Kobara API", icon: Server, desc: "Process the request" },
  { id: 3, label: "MonCash", icon: ShieldCheck, desc: "Authorize payment" },
  { id: 4, label: "Customer", icon: Smartphone, desc: "Confirms payment" },
  { id: 5, label: "Kobara", icon: Database, desc: "Verifies & stores transaction" },
  { id: 6, label: "Your Frontend", icon: Layout, desc: "Show success to customer" },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-[#07111F] relative overflow-hidden border-y border-[#1E2A38]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How it works
          </h2>
          <p className="text-[#AAB3C2] text-lg">
            Your backend creates the request. Kobara processes it. Your frontend shows the result.
          </p>
        </div>

        {/* Horizontal Flow Desktop / Vertical Flow Mobile */}
        <div className="relative flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12 lg:gap-4">
          
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-[#1E2A38] -z-10">
            <motion.div 
              className="h-full bg-gradient-to-r from-transparent via-[#FF4A1C] to-transparent"
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              viewport={{ once: true }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />
          </div>

          {/* Animated Connecting Line (Mobile) */}
          <div className="block lg:hidden absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-[2px] bg-[#1E2A38] -z-10">
            <motion.div 
              className="w-full bg-gradient-to-b from-transparent via-[#FF4A1C] to-transparent h-1/3"
              initial={{ y: "-100%" }}
              whileInView={{ y: "300%" }}
              viewport={{ once: true }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center max-w-[150px] relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#020B14] border-2 border-[#1E2A38] flex items-center justify-center mb-6 relative group">
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-[#FF4A1C]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <step.icon className="w-8 h-8 text-[#FF4A1C] relative z-10" />
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#1E2A38] text-xs font-bold text-white flex items-center justify-center border border-[#07111F]">
                  {step.id}
                </div>
              </div>
              <h4 className="text-white font-bold mb-2 text-sm">{step.label}</h4>
              <p className="text-[#AAB3C2] text-xs">{step.desc}</p>
            </motion.div>
          ))}
          
        </div>

      </div>
    </section>
  );
}
