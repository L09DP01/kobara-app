"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { signOut } from "next-auth/react";

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
      { href: "/dashboard/payments", icon: "payments", label: "Paiements" },
      { href: "/dashboard/customers", icon: "group", label: "Clients" },
      { href: "/dashboard/withdrawals", icon: "account_balance_wallet", label: "Retraits" },
    ]
  },
  {
    title: "Développeurs",
    links: [
      { href: "/dashboard/api-keys", icon: "vpn_key", label: "Clés API" },
      { href: "/dashboard/webhooks", icon: "webhook", label: "Webhooks" },
      { href: "/dashboard/developers", icon: "code", label: "Documentation" },
    ]
  },
  {
    title: "Entreprise",
    links: [
      { href: "/dashboard/analytics", icon: "analytics", label: "Analyses" },
      { href: "/dashboard/kyc", icon: "verified_user", label: "Vérification KYC" },
      { href: "/dashboard/settings", icon: "settings", label: "Paramètres" },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed flex flex-col z-40 bg-surface-container-lowest text-text-primary font-body-base text-body-base docked w-[260px] left-0 top-0 bottom-0 border-r border-border-subtle shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header / Logo */}
      <div className="px-6 py-6 flex justify-between items-center h-20 shrink-0">
        <Link href="/dashboard" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Kobara Logo"
            className="w-36 h-auto object-contain -ml-2"
          />
        </Link>
        <button
          onClick={onClose}
          className="md:hidden text-text-secondary hover:text-primary transition-colors p-1"
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
                const isActive = ('exact' in link && (link as any).exact) ? pathname === link.href : pathname?.startsWith(link.href);

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
            href="/dashboard/support" 
            onClick={onClose} 
            className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-all duration-200 rounded-xl text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            <span>Support client</span>
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-status-error/80 hover:bg-status-error/10 hover:text-status-error transition-all duration-200 rounded-xl text-sm font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
