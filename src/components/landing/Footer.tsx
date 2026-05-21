"use client";

import Link from "next/link";
import { Code2, MessageCircle, Share2, Mail } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export function Footer() {
  const { t, language } = useTranslation();

  return (
    <footer className="py-16 sm:py-20 relative border-t border-slate-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Kobara"
                className="w-36 h-auto object-contain"
              />
            </Link>
            <p className="text-kobara-secondary font-medium max-w-xs leading-relaxed">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { icon: MessageCircle, href: "#" },
                { icon: Code2, href: "#" },
                { icon: Share2, href: "#" },
                { icon: Mail, href: "mailto:support@kobara.app" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-kobara-primary hover:border-kobara-primary transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-5">
            <h4 className="text-sm font-black text-kobara-primary uppercase tracking-widest">
              {language === "fr" ? "Produit" : "Product"}
            </h4>
            <ul className="space-y-3">
              <li><Link href="/pricing"              className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">{t("nav.pricing")}</Link></li>
              <li><Link href="/dashboard/developers" className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">{t("nav.developers")}</Link></li>
              <li><Link href="/docs" className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">{t("nav.documentation")}</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-5">
            <h4 className="text-sm font-black text-kobara-primary uppercase tracking-widest">
              {language === "fr" ? "Entreprise" : "Company"}
            </h4>
            <ul className="space-y-3">
              <li><Link href="/contact"  className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">{t("nav.contact")}</Link></li>
              <li><Link href="/privacy"  className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">{t("nav.privacy")}</Link></li>
              <li><Link href="/terms"    className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">{t("nav.terms")}</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-5">
            <h4 className="text-sm font-black text-kobara-primary uppercase tracking-widest">Support</h4>
            <ul className="space-y-3">
              <li><a href="mailto:support@kobara.app" className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">support@kobara.app</a></li>
              <li><Link href="/dashboard/developers" className="text-kobara-secondary hover:text-kobara-primary transition-colors font-medium">API Reference</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} Kobara. {language === "fr" ? "Tous droits réservés." : "All rights reserved."}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {language === "fr" ? "Systèmes opérationnels" : "Systems Operational"}
          </div>
        </div>
      </div>
    </footer>
  );
}

