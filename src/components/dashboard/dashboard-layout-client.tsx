"use client";

import { useState } from "react";
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
}: {
  children: React.ReactNode;
  merchant?: any;
  user?: any;
  isGuest?: boolean;
  initialNotifications?: any[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Guest view: no sidebar, no top-nav toggle — just the content
  if (isGuest) {
    return (
      <div className="bg-background-main font-body-base text-body-base text-on-surface antialiased min-h-[100dvh]">
        {/* Minimal guest top bar with login CTA */}
        <div className="h-16 border-b border-border-subtle bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <a href={siteConfig.url} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Kobara"
              className="w-32 h-auto object-contain"
            />
          </a>
          <div className="flex items-center gap-4">
            <a
              href={`${siteConfig.url}/login`}
              className="text-sm font-semibold text-kobara-primary hover:opacity-70 transition-opacity"
            >
              Log in
            </a>
            <a
              href={`${siteConfig.url}/register`}
              className="h-9 px-5 rounded-lg bg-kobara-primary hover:bg-slate-900 text-white text-sm font-bold transition-all flex items-center"
            >
              Sign up free
            </a>
          </div>
        </div>
        <main className="flex-1 p-container-padding flex flex-col gap-8">
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
        <TopNav onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} merchant={merchant} user={user} initialNotifications={initialNotifications} />
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
