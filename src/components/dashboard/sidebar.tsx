"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import { siteConfig } from "@/config/site";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_SECTIONS = [
  {
    title: "Général",
    links: [
      { href: "/dashboard", icon: "dashboard", label: "Dashboard", exact: true },
    ]
  },
  {
    title: "Opérations",
    links: [
      { href: "/payments", icon: "payments", label: "Paiements" },
      { href: "/customers", icon: "group", label: "Clients" },
      { href: "/withdrawals", icon: "account_balance_wallet", label: "Retraits" },
    ]
  },
  {
    title: "Développeurs",
    links: [
      { href: "/api-keys", icon: "vpn_key", label: "Clés API" },
      { href: "/webhooks", icon: "webhook", label: "Webhooks" },
      { href: "/developers", icon: "code", label: "Documentation" },
    ]
  },
  {
    title: "Entreprise",
    links: [
      { href: "/analytics", icon: "analytics", label: "Analyses" },
      { href: "/kyc", icon: "verified_user", label: "Vérification KYC" },
      { href: "/settings", icon: "settings", label: "Paramètres" },
    ]
  }
];

export function DesktopSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col bg-[#0F1626] text-slate-300 font-body-base text-body-base border-r border-slate-900/50 shadow-xl">
      <SidebarContent pathname={pathname} onClose={() => {}} />
    </aside>
  );
}

import { useEffect } from "react";

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Sidebar Panel */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-[#0F1626] text-slate-300 font-body-base text-body-base shadow-xl transition-transform duration-300 ease-in-out overflow-hidden h-full",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent pathname={pathname} onClose={onClose} />
      </aside>
    </div>
  );
}

function SidebarContent({ pathname, onClose }: { pathname: string | null; onClose: () => void }) {
  return (
    <>
      {/* Header / Logo */}
      <div className="px-6 py-6 flex justify-between items-center h-20 shrink-0">
        <a href={siteConfig.url} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo2.png"
            alt="Kobara Logo"
            className="w-32 h-auto object-contain"
          />
        </a>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-hide">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={idx}>
            {section.title !== "Général" && (
              <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.links.map((link) => {
                const isActive = ('exact' in link && (link as any).exact) 
                  ? pathname === link.href 
                  : pathname?.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={clsx(
                      "flex items-center gap-3 px-6 py-3 group transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-orange-500/20 to-transparent text-white font-semibold border-l-[3px] border-orange-500"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-[3px] border-transparent"
                    )}
                  >
                    <span className={clsx(
                      "material-symbols-outlined text-[20px] transition-colors duration-200",
                      isActive ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300"
                    )}>
                      {link.icon}
                    </span>
                    <span className="text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Area */}
      <div className="p-4 border-t border-slate-800/50 mt-auto bg-[#0F1626] shrink-0">
        <div className="space-y-1">
          <Link 
            href="/support" 
            onClick={onClose} 
            className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-200 rounded-lg text-sm font-medium mx-2"
          >
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            <span>Support client</span>
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL || "https://kobara.app" })}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 rounded-lg text-sm font-medium cursor-pointer mx-2"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
