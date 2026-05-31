"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { getDashboardUrl } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSession } from "next-auth/react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((sess) => {
      setSession(sess);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://dashboard.kobara.app";
  const isLoggedIn = !!session;

  const navLinks = [
    { label: t("nav.developers"),    href: "/dashboard/developers" },
    { label: t("nav.pricing"),       href: "/pricing" },
    { label: t("nav.documentation"), href: "/docs" },
    { label: t("nav.contact"),       href: "/contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-50 h-20"
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-full flex items-center justify-between">

          {/* Brand — real Kobara logo */}
          <Link href="/" className="flex items-center gap-2 group relative z-[60]">
            <Image 
              src="/Icone.png" 
              alt="Kobara Logo" 
              width={32} 
              height={32} 
              className="rounded-lg shadow-sm" 
            />
            <span className="font-bold text-xl text-slate-900 tracking-tight">Kobara</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] font-semibold text-kobara-secondary hover:text-kobara-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher />
            {!loading && (
              isLoggedIn ? (
                <a
                  href={`${dashboardUrl}`}
                  className="bg-kobara-primary hover:bg-slate-900 text-white px-6 h-11 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center text-[15px]"
                >
                  {language === "fr" ? "Mon compte" : "My Account"}
                </a>
              ) : (
                <>
                  <Link
                    href={getDashboardUrl('/login')}
                    className="text-[15px] font-semibold text-kobara-primary hover:opacity-70 transition-opacity"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href={getDashboardUrl('/register')}
                    className="bg-kobara-primary hover:bg-slate-900 text-white px-6 h-11 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center text-[15px]"
                  >
                    {t("nav.signup")}
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              className="p-2 rounded-xl text-kobara-primary hover:bg-white/60 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed top-20 inset-x-0 z-40 mx-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-2xl p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[17px] font-bold text-kobara-primary hover:text-kobara-red transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3 mt-1">
              {!loading && (
                isLoggedIn ? (
                  <a
                    href={`${dashboardUrl}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-center h-11 flex items-center justify-center rounded-xl bg-kobara-primary text-white font-bold text-[15px] hover:bg-slate-900 transition-colors"
                  >
                    {language === "fr" ? "Mon compte" : "My Account"}
                  </a>
                ) : (
                  <>
                    <Link
                      href={getDashboardUrl('/login')}
                      onClick={() => setMobileOpen(false)}
                      className="text-center h-11 flex items-center justify-center rounded-xl border border-slate-200 text-kobara-primary font-bold text-[15px] hover:bg-slate-50 transition-colors"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href={getDashboardUrl('/register')}
                      onClick={() => setMobileOpen(false)}
                      className="text-center h-11 flex items-center justify-center rounded-xl bg-kobara-primary text-white font-bold text-[15px] hover:bg-slate-900 transition-colors"
                    >
                      {t("nav.signup")}
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

