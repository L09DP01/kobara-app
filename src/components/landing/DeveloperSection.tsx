"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DeveloperSection() {
  return (
    <section className="py-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-[3rem] p-8 lg:p-20 border border-slate-100 shadow-[0_32px_64px_rgba(11,19,36,0.04)] relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Developer First</h2>
                <h3 className="text-4xl lg:text-5xl font-extrabold text-kobara-primary mb-6">Integrate in minutes, not days.</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  Our unified API allows you to accept MonCash payments with minimal code. We handle the complex security, retry logic, and edge cases so you can focus on building your product.
                </p>
              </div>

              <ul className="space-y-5">
                {[
                  "Idempotent requests & secure headers",
                  "Comprehensive sandbox & test environments",
                  "Granular API keys and merchant permissions",
                  "Auto-retry logic for webhook delivery"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link 
                href="/docs" 
                className="inline-flex items-center gap-3 text-kobara-primary font-bold hover:text-kobara-orange transition-colors group text-lg"
              >
                Explore Documentation 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Code Snippet Card */}
              <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-white/10 relative z-10 group overflow-hidden">
                <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-6">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-slate-500 font-mono tracking-wider">create_payment.js</span>
                </div>
                
                <pre className="font-mono text-[14px] leading-relaxed text-slate-300">
                  <code>
                    <span className="text-pink-400">const</span> kobara = <span className="text-blue-400">require</span>(<span className="text-emerald-400">'kobara-node'</span>)(<span className="text-emerald-400">'kbr_sk_live_...'</span>);{"\n\n"}
                    <span className="text-pink-400">const</span> charge = <span className="text-pink-400">await</span> kobara.charges.<span className="text-blue-400">create</span>({"{"}{"\n"}
                    {"  "}<span className="text-amber-400">amount</span>: <span className="text-orange-400">2500</span>,{"\n"}
                    {"  "}<span className="text-amber-400">currency</span>: <span className="text-emerald-400">'HTG'</span>,{"\n"}
                    {"  "}<span className="text-amber-400">phone</span>: <span className="text-emerald-400">'+50930000000'</span>,{"\n"}
                    {"  "}<span className="text-amber-400">description</span>: <span className="text-emerald-400">'Order #991'</span>{"\n"}
                    {"}"});{"\n\n"}
                    <span className="text-slate-500">// Handle the response</span>{"\n"}
                    <span className="text-pink-400">if</span> (charge.status === <span className="text-emerald-400">'success'</span>) {"{"}{"\n"}
                    {"  "}fulfillOrder();{"\n"}
                    {"}"}
                  </code>
                </pre>

                {/* Decorative data flow inside code card */}
                <motion.div 
                  animate={{ 
                    x: ["-100%", "200%"],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-transparent via-kobara-orange to-transparent opacity-50"
                />
              </div>

              {/* Background Shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-kobara-orange/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-kobara-red/10 rounded-full blur-3xl -z-10" />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
