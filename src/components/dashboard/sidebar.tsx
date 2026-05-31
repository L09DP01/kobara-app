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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col bg-surface-container-lowest text-text-primary font-body-base text-body-base border-r border-border-subtle shadow-sm">
      <SidebarContent pathname={pathname} onClose={() => {}} />
    </aside>
  );
}

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  
  return (
    <div className="lg:hidden">
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity h-[100dvh]" 
          onClick={onClose} 
        />
      )}
      
      {/* Sidebar Panel */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-surface-container-lowest text-text-primary font-body-base text-body-base shadow-xl transition-transform duration-300 ease-in-out h-[100dvh] overflow-hidden",
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
            src="/logo.png"
            alt="Kobara Logo"
            className="w-36 h-auto object-contain -ml-2"
          />
        </a>
        <button
          onClick={onClose}
          className="lg:hidden text-text-secondary hover:text-primary transition-colors p-1"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-hide">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={idx}>
            {section.title !== "Général" && (
              <h3 className="px-3 mb-2 text-[11px] font-bold text-text-secondary uppercase tracking-wider">
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
                      "flex items-center gap-3 px-3 py-2.5 group rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-text-secondary hover:bg-surface-container-low hover:text-text-primary"
                    )}
                  >
                    <span className={clsx(
                      "material-symbols-outlined text-[20px] transition-colors duration-200",
                      isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
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
      <div className="p-4 border-t border-border-subtle mt-auto bg-surface-container-lowest/50 shrink-0">
        <div className="space-y-1">
          <Link 
            href="/support" 
            onClick={onClose} 
            className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-all duration-200 rounded-xl text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            <span>Support client</span>
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL || "https://kobara.app" })}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-status-error/80 hover:bg-status-error/10 hover:text-status-error transition-all duration-200 rounded-xl text-sm font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
