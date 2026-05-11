"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/70 backdrop-blur-xl border-b border-white/40"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-kobara-red to-kobara-orange flex items-center justify-center text-white shadow-lg shadow-kobara-red/20 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
             <Image 
                src="/images/logo.png" 
                alt="Kobara Logo" 
                width={36} 
                height={36} 
                className="object-contain p-1.5"
             />
          </div>
          <span className="text-xl font-bold text-kobara-primary tracking-tight">
            Kobara
          </span>
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/developers" className="text-sm font-semibold text-slate-600 hover:text-kobara-primary transition-colors">
            Developers
          </Link>
          <Link href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-kobara-primary transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm font-semibold text-slate-600 hover:text-kobara-primary transition-colors">
            Documentation
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-kobara-primary transition-colors">
            Contact
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-kobara-primary transition-colors"
          >
            Log In
          </Link>
          <Button 
            asChild
            className="bg-kobara-primary hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-slate-200 hover:shadow-slate-300 active:scale-95"
          >
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
