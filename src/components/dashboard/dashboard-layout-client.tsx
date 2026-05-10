"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import TopNav from "@/components/dashboard/top-nav";

export default function DashboardLayoutClient({ children, merchant }: { children: React.ReactNode, merchant?: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background-main font-body-base text-body-base text-on-surface antialiased min-h-screen flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[260px] w-full md:w-[calc(100%-260px)]">
        <TopNav onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} merchant={merchant} />
        <main className="flex-1 p-container-padding flex flex-col gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
