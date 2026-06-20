"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: t("nav.developers") || "Développeurs", href: '/dashboard/developers' },
    { name: t("nav.pricing") || "Tarifs", href: '/pricing' },
    { name: t("nav.documentation") || "Documentation", href: '/docs' },
    { name: t("nav.contact") || "Contact", href: '/contact' }
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#020B14]/80 border-b border-[#1E2A38]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Icone.png" alt="Kobara" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-white tracking-tight">Kobara</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[#AAB3C2] hover:text-white transition-colors text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-[#AAB3C2] hover:text-white transition-colors text-sm font-medium"
          >
            {t("nav.login") || "Connexion"}
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-full bg-[#FF4A1C] hover:bg-[#FF2E14] text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(255,74,28,0.3)] hover:shadow-[0_0_25px_rgba(255,74,28,0.5)] min-h-[44px] flex items-center justify-center"
          >
            {t("nav.signup") || "Créer un compte"}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center justify-center w-11 h-11 text-white z-50"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-0 left-0 w-full bg-[#020B14] border-b border-[#1E2A38] pt-20 px-4 pb-8 flex flex-col h-screen overflow-y-auto"
          >
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-white text-xl font-medium border-b border-white/5 pb-4"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 mt-auto pt-8">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-white border border-[#1E2A38] rounded-xl font-medium min-h-[44px]"
              >
                {t("nav.login") || "Connexion"}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-white bg-[#FF4A1C] rounded-xl font-bold min-h-[44px]"
              >
                {t("nav.signup") || "Créer un compte gratuit"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
