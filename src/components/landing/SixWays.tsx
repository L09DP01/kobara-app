"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Link2, QrCode, Smartphone, FileText, Code2 } from "lucide-react";

const ways = [
  {
    title: "Online Payments",
    description: "Accept payments on your website with our Pay Button.",
    icon: ShoppingCart,
  },
  {
    title: "Payment Links",
    description: "Create and share payment links instantly.",
    icon: Link2,
  },
  {
    title: "QR Codes",
    description: "Generate QR codes for fast and easy payments.",
    icon: QrCode,
  },
  {
    title: "Payment Terminal",
    description: "Accept in-store payments with a smart terminal.",
    icon: Smartphone,
  },
  {
    title: "Invoices",
    description: "Send professional invoices and get paid faster.",
    icon: FileText,
  },
  {
    title: "API Integration",
    description: "Seamlessly integrate payments into your platform.",
    icon: Code2,
  },
];

export function SixWays() {
  return (
    <section className="py-24 bg-[#020B14] relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-bold text-[#FF4A1C] tracking-widest uppercase mb-4">
            Six Ways To Get Paid
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get paid <span className="text-[#FF4A1C]">your</span> way
          </h2>
          <p className="text-[#AAB3C2] text-lg">
            Multiple solutions to collect payments and grow your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ways.map((way, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 bg-[#07111F] rounded-2xl border border-[#1E2A38] hover:border-[#FF4A1C]/50 transition-all overflow-hidden cursor-pointer"
            >
              {/* Background Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4A1C]/0 via-transparent to-transparent group-hover:from-[#FF4A1C]/10 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#020B14] border border-[#1E2A38] group-hover:border-[#FF4A1C] flex items-center justify-center mb-6 transition-colors shadow-lg">
                  <way.icon className="w-7 h-7 text-[#FF4A1C]" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{way.title}</h3>
                <p className="text-[#AAB3C2] leading-relaxed">
                  {way.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
