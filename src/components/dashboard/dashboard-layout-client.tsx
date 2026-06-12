"use client";

import { useState, useEffect } from "react";
import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import TopNav from "@/components/dashboard/top-nav";
import { KycRequiredBanner } from "@/components/dashboard/kyc-banner";
import { siteConfig } from "@/config/site";

export default function DashboardLayoutClient({
  children,
  merchant,
  user,
  isGuest = false,
  initialNotifications = [],
  accessibleMerchants = [],
  userRole = 'owner',
}: {
  children: React.ReactNode;
  merchant?: any;
  user?: any;
  isGuest?: boolean;
  initialNotifications?: any[];
  accessibleMerchants?: any[];
  userRole?: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Apply dark theme to body to prevent white backgrounds from parent paddings
  useEffect(() => {
    if (!isGuest) {
      document.body.style.backgroundColor = '#0F1626';
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [isGuest]);

  // Guest view: no sidebar, no top-nav toggle — just the content
  if (isGuest) {
    return (
      <div className="bg-[#0F1626] font-body-base text-body-base text-white antialiased min-h-[100dvh]">
        {/* Minimal guest top bar with login CTA */}
        <div className="h-16 border-b border-[#1E2A38] bg-[#020B14]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <a href={siteConfig.url} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Icone.png"
              alt="Kobara"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white tracking-tight">Kobara</span>
          </a>
          <div className="flex items-center gap-4">
            <a
              href={`${siteConfig.url}/login`}
              className="text-sm font-semibold text-[#AAB3C2] hover:text-white transition-colors"
            >
              Connexion
            </a>
            <a
              href={`${siteConfig.url}/register`}
              className="h-9 px-5 rounded-full bg-[#FF4A1C] hover:bg-[#FF2E14] text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,74,28,0.3)] hover:shadow-[0_0_25px_rgba(255,74,28,0.5)] flex items-center"
            >
              Créer un compte
            </a>
          </div>
        </div>
        <main className="flex-1 p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative bg-[#0F1626] font-body-base text-body-base text-white antialiased flex-1 flex flex-col min-h-[100dvh]">

      <DesktopSidebar />
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-full lg:pl-[260px] transition-all duration-300">
        <TopNav onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} merchant={merchant} user={user} initialNotifications={initialNotifications} accessibleMerchants={accessibleMerchants} userRole={userRole} />
        {merchant && merchant.kyc_status !== 'approved' && (
          <KycRequiredBanner />
        )}
        <main className="flex-1 p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
