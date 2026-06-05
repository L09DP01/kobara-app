'use client'

import { useState } from 'react';
import { ProfileSettings } from './components/ProfileSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { NotificationSettings } from './components/NotificationSettings';
import { TeamSettings } from './components/TeamSettings';
import { PayoutSettings } from './components/PayoutSettings';

type Tab = 'profile' | 'payouts' | 'security' | 'notifications' | 'team';

export function SettingsClient({ user, merchant, settings, members, userRole = 'owner' }: { user: any, merchant: any, settings: any, members: any[], userRole?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab, label: string, icon: string, desc: string, ownerOnly?: boolean }[] = [
    { id: 'profile', label: 'Profil Entreprise', icon: 'store', desc: 'Logo, nom, adresse' },
    { id: 'payouts', label: 'Comptes de Retrait', icon: 'account_balance', desc: 'MonCash, banques', ownerOnly: true },
    { id: 'security', label: 'Sécurité', icon: 'shield', desc: 'Mot de passe, 2FA', ownerOnly: true },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', desc: 'Email, push, alertes' },
    { id: 'team', label: "Membres d'équipe", icon: 'group', desc: 'Rôles et accès', ownerOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.ownerOnly || userRole === 'owner');

  return (
    <div className="max-w-[1080px] mx-auto w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-slate-400">settings</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Paramètres</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gérez les préférences de votre compte et de votre entreprise.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="md:col-span-1">
          <nav className="bg-white/5 rounded-3xl border border-white/10 shadow-sm overflow-hidden py-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all duration-200 border-l-[3px] ${
                  activeTab === tab.id 
                    ? 'bg-white/5 border-l-orange-500 text-white' 
                    : 'border-l-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-500'}`}>
                  {tab.icon}
                </span>
                <div>
                  <span className="text-sm font-bold block">{tab.label}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{tab.desc}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && <ProfileSettings user={user} merchant={merchant} />}
          {activeTab === 'payouts' && <PayoutSettings settings={settings} />}
          {activeTab === 'security' && <SecuritySettings user={user} settings={settings} />}
          {activeTab === 'notifications' && <NotificationSettings settings={settings} />}
          {activeTab === 'team' && <TeamSettings members={members} />}
        </div>
      </div>
    </div>
  );
}
