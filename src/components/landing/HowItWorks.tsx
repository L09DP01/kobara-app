"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Create Account",
    description: "Register your business on the Kobara dashboard securely in minutes."
  },
  {
    title: "Generate API Key",
    description: "Obtain your unique keys to connect your app instantly to our infrastructure."
  },
  {
    title: "Accept Payments",
    description: "Start processing MonCash transactions with real-time webhooks and SDKs."
  }
];

export function HowItWorks() {
  return (
    <section className="py-32 relative">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Process</h2>
          <h3 className="text-4xl lg:text-5xl font-extrabold text-kobara-primary">How it works</h3>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-6 relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-8 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-200 z-0" />
          
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex-1 flex flex-col items-center relative z-10 group"
            >
              <div className="w-16 h-16 bg-kobara-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-8 shadow-2xl shadow-slate-300 group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>
              <h4 className="text-2xl font-bold text-kobara-primary mb-4">{step.title}</h4>
              <p className="text-slate-500 font-medium leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
