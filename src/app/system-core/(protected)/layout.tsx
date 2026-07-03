'use client';

import AdminSessionManager from "@/components/admin/AdminSessionManager";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, 
  Activity, 
  Users, 
  ShieldAlert, 
  CreditCard, 
  Banknote, 
  LifeBuoy, 
  SearchCode,
  LogOut,
  Mail
} from "lucide-react";

export default function SystemCoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "DASHBOARD", href: "/system-core/dashboard", icon: Activity },
    { name: "MERCHANTS", href: "/system-core/merchants", icon: Users },
    { name: "KYC REVIEW", href: "/system-core/kyc", icon: ShieldAlert },
    { name: "TRANSACTIONS", href: "/system-core/transactions", icon: CreditCard },
    { name: "WITHDRAWALS", href: "/system-core/withdrawals", icon: Banknote },
    { name: "SUPPORT", href: "/system-core/support", icon: LifeBuoy },
    { name: "AUDIT LOGS", href: "/system-core/audit", icon: SearchCode },
    { name: "RISK MONITORING", href: "/system-core/risk-monitoring", icon: ShieldAlert },
    { name: "MESSAGING", href: "/system-core/messaging", icon: Mail },
    { name: "SMS GATEWAY", href: "/system-core/sms-gateway", icon: Terminal },
    { name: "LEGAL & CGU (IA)", href: "/system-core/legal/cgu-rules", icon: SearchCode },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex font-mono selection:bg-red-500/30">
      <AdminSessionManager>
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col hidden md:flex">
          <div className="p-6 border-b border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              K
            </div>
            <div>
              <div className="font-bold text-slate-200 tracking-wider">CORE_SYSTEM</div>
              <div className="text-[10px] text-green-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                ONLINE
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 mb-4 px-2 tracking-widest">MODULES</div>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-sm tracking-wider ${
                    isActive 
                      ? "bg-red-950/40 text-red-400 border-l-2 border-red-500" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Link 
              href="/api/admin/auth/logout"
              prefetch={false}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm tracking-wider text-red-500 hover:text-red-400 hover:bg-red-950/30 transition-all border border-red-900/30"
            >
              <LogOut className="w-4 h-4" />
              TERMINATE SESSION
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-[100dvh] overflow-hidden">
          {/* Topbar for mobile and breadcrumbs/status */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Terminal className="w-4 h-4" />
              <span className="text-slate-500">~</span>
              <span className="text-slate-300">{pathname.replace('/system-core', '') || '/dashboard'}</span>
            </div>
            
            <div className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              SUPER ADMIN
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </AdminSessionManager>
    </div>
  );
}
