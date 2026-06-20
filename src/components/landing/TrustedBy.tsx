"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";

const partners = [
  "Digicel",
  "NatCash",
  "Sogebank",
  "Unibank",
  "BRH",
  "BNC",
  "Tresor"
];

export function TrustedBy() {
  const { t } = useTranslation();

  return (
    <section className="py-12 border-y border-[#1E2A38] bg-[#020B14] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[#AAB3C2] font-medium mb-8 uppercase">
          {t("home.trustedBy")}
        </p>
        
        {/* We use a simple scrolling marquee or flex wrap */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-xl md:text-2xl font-bold text-[#AAB3C2] grayscale hover:grayscale-0 transition-all cursor-default"
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
