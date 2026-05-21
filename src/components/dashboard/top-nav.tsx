'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { signOut } from 'next-auth/react';

export default function TopNav({ onToggleSidebar, merchant, user }: { onToggleSidebar: () => void, merchant?: any, user?: any }) {
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
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md dark:bg-primary/80 text-primary dark:text-on-primary font-headline-md text-headline-md docked full-width top-0 sticky border-b border-border-subtle dark:border-outline-variant flat flex justify-between items-center h-20 px-container-padding z-30 transition-all duration-200 ease-in-out">
      {/* Left: Greeting / Search */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile menu toggle */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden text-text-secondary hover:text-primary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Mobile Logo */}
        <Link href="/dashboard" className="md:hidden flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Kobara Logo"
            className="w-32 h-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex flex-col">
          <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
            Bonsoir, {user?.first_name || merchant?.business_name || 'Nouveau Marchand'} 👋
          </h2>
          <span className="font-body-sm text-body-sm text-text-secondary">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 relative">
          
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-text-secondary hover:bg-surface-container rounded-lg transition-colors hover:text-primary relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {/* Unread red dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full border-2 border-surface"></span>
            </button>
            
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                  <h3 className="font-headline-sm text-text-primary">Notifications</h3>
                  <button className="text-body-sm text-primary hover:underline">Tout marquer comme lu</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {/* Welcome notification */}
                  <div className="p-4 hover:bg-surface-container-lowest transition-colors border-b border-border-subtle cursor-pointer">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-status-success/20 flex items-center justify-center text-status-success shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">celebration</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-base text-body-base text-text-primary font-medium">Bienvenue sur Kobara 🎉</p>
                        <p className="text-body-sm text-text-secondary mt-0.5">Votre compte marchand est prêt. Commencez à accepter des paiements dès maintenant.</p>
                        <p className="text-[11px] text-text-secondary mt-1.5 uppercase tracking-wider font-semibold">À l&apos;instant</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                    </div>
                  </div>
                  {/* Secure account notification */}
                  <div className="p-4 hover:bg-surface-container-lowest transition-colors cursor-pointer">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">shield</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-base text-body-base text-text-primary font-medium">Sécurisez votre compte</p>
                        <p className="text-body-sm text-text-secondary mt-0.5">Activez l&apos;authentification à deux facteurs pour protéger votre compte.</p>
                        <p className="text-[11px] text-text-secondary mt-1.5 uppercase tracking-wider font-semibold">Il y a 5 min</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                    </div>
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
