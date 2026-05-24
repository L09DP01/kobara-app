import AdminSessionManager from "@/components/admin/AdminSessionManager";
import Link from "next/link";

export default function SystemCoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-mono">
      <AdminSessionManager>
        {/* Navbar ultra minimaliste pour le super admin */}
        <header className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white">K</div>
            <span className="font-bold text-slate-300">CORE_SYSTEM</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/system-core/dashboard" className="hover:text-red-400 transition-colors">DASHBOARD</Link>
            <Link href="/system-core/merchants" className="hover:text-red-400 transition-colors">MERCHANTS</Link>
            <Link href="/system-core/support" className="hover:text-red-400 transition-colors">TICKETS</Link>
            <Link href="/api/admin/auth/logout" prefetch={false} className="text-red-500 hover:text-red-400 transition-colors ml-4 border border-red-900/50 px-3 py-1 rounded bg-red-950/20">
              DISCONNECT
            </Link>
          </nav>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </AdminSessionManager>
    </div>
  );
}
