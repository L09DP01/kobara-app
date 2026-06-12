"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-[#020B14]/80 border-b border-[#1E2A38]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Icone.png" alt="Kobara" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-white tracking-tight">Kobara</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: 'Développeurs', href: '/dashboard/developers' },
            { name: 'Tarifs', href: '/pricing' },
            { name: 'Documentation', href: '/docs' },
            { name: 'Contact', href: '/contact' }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[#AAB3C2] hover:text-white transition-colors text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block text-[#AAB3C2] hover:text-white transition-colors text-sm font-medium"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full bg-[#FF4A1C] hover:bg-[#FF2E14] text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(255,74,28,0.3)] hover:shadow-[0_0_25px_rgba(255,74,28,0.5)]"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
