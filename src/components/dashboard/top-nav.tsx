'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function TopNav({ onToggleSidebar, merchant }: { onToggleSidebar: () => void, merchant?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md dark:bg-primary/80 text-primary dark:text-on-primary font-headline-md text-headline-md docked full-width top-0 sticky border-b border-border-subtle dark:border-outline-variant flat flex justify-between items-center h-20 px-container-padding z-30 transition-all duration-200 ease-in-out">
      {/* Left: Greeting / Search */}
      <div className="flex items-center gap-6">
        {/* Mobile menu toggle */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden text-text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden md:flex flex-col">
          <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
            Bonsoir, {merchant ? merchant.business_name : 'Nouveau Marchand'} 👋
          </h2>
          <span className="font-body-sm text-body-sm text-text-secondary">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payment-links" className="hidden lg:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-body-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Créer un lien de paiement
        </Link>
        <div className="flex items-center gap-2 border-l border-border-subtle pl-4 ml-2 relative">
          
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-text-secondary hover:bg-surface-container rounded-lg transition-colors hover:text-primary relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {/* Optional: red dot for unread notifications */}
              {/* <span className="absolute top-2 right-2 w-2 h-2 bg-status-error rounded-full border-2 border-surface"></span> */}
            </button>
            
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                  <h3 className="font-headline-sm text-text-primary">Notifications</h3>
                  <button className="text-body-sm text-primary hover:underline">Tout marquer comme lu</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-8 text-center text-text-secondary flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[32px] opacity-50">notifications_off</span>
                    <p className="text-body-sm">Aucune nouvelle notification</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard/settings" className="p-2 text-text-secondary hover:bg-surface-container rounded-lg transition-colors hover:text-primary hidden sm:block">
            <span className="material-symbols-outlined">settings_suggest</span>
          </Link>
          
          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative ml-2">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full border border-border-subtle overflow-hidden hover:opacity-80 transition-opacity focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {merchant?.logo_url ? (
                <img alt="User profile" className="w-full h-full object-cover" src={merchant.logo_url} />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {merchant?.business_name ? merchant.business_name.charAt(0) : 'U'}
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden z-50 py-2">
                <div className="px-4 py-3 border-b border-border-subtle mb-2">
                  <p className="text-body-sm font-medium text-text-primary truncate">{merchant?.business_name || 'Business'}</p>
                  <p className="text-[12px] text-text-secondary truncate">{merchant?.email || 'email@example.com'}</p>
                </div>
                
                <div className="flex flex-col px-2">
                  <Link href="/dashboard/settings" className="px-3 py-2 text-body-sm text-text-primary hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    Mon profil
                  </Link>
                  <Link href="/dashboard/settings" className="px-3 py-2 text-body-sm text-text-primary hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    Plan Actuel
                  </Link>
                  <div className="h-px bg-border-subtle my-2 mx-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-body-sm text-status-error hover:bg-status-error/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
