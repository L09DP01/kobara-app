"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_LINKS = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/payments", icon: "payments", label: "Paiements" },
  { href: "/dashboard/payment-links", icon: "link", label: "Liens de paiement" },
  { href: "/dashboard/customers", icon: "group", label: "Clients" },
  { href: "/dashboard/withdrawals", icon: "account_balance_wallet", label: "Retraits" },
  { href: "/dashboard/api-keys", icon: "vpn_key", label: "Clés API" },
  { href: "/dashboard/webhooks", icon: "webhook", label: "Webhooks" },
  { href: "/dashboard/developers", icon: "code", label: "Développeurs" },
  { href: "/dashboard/analytics", icon: "analytics", label: "Analyses" },
  { href: "/dashboard/settings", icon: "settings", label: "Paramètres" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed flex flex-col z-40 bg-surface-container-lowest dark:bg-primary-container text-primary dark:text-on-primary font-body-base text-body-base docked w-[260px] left-0 top-0 bottom-0 border-r border-border-subtle dark:border-outline-variant flat transition-transform duration-300 ease-in-out md:translate-x-0 md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="px-6 py-8 flex justify-between items-start gap-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-md font-display-xl font-extrabold text-primary dark:text-on-primary tracking-tight">Kobara.app</h1>
          <span className="text-body-sm text-text-secondary"></span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-text-secondary hover:text-primary transition-colors mt-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 mt-4">
        {SIDEBAR_LINKS.map((link) => {
          // Fix for active path matching
          const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 group rounded-lg",
                isActive
                  ? "text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed/10 border-l-4 border-secondary dark:border-secondary-fixed-dim font-semibold rounded-l-none"
                  : "text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-primary-fixed-dim/10 transition-colors hover:bg-surface-container-high dark:hover:bg-primary-container"
              )}
            >
              <span className={clsx(
                "material-symbols-outlined text-[20px]",
                !isActive && "text-text-secondary group-hover:text-primary transition-colors"
              )}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Create Link Button */}
      <div className="p-4 border-t border-border-subtle dark:border-outline-variant mt-auto flex-shrink-0">
        <button className="w-full bg-primary hover:bg-inverse-surface text-on-primary font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          Créer un lien
        </button>
        <div className="mt-4 space-y-2">
          <Link href="/help" onClick={onClose} className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary dark:text-on-primary-container dark:hover:text-primary-fixed-dim transition-colors text-body-sm">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>Centre d'aide</span>
          </Link>
          <button className="flex items-center w-full gap-3 px-4 py-2 text-on-surface-variant hover:text-primary dark:text-on-primary-container dark:hover:text-primary-fixed-dim transition-colors text-body-sm">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
