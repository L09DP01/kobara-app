'use client'

import { useState } from 'react';
import { ProfileSettings } from './components/ProfileSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { NotificationSettings } from './components/NotificationSettings';
import { TeamSettings } from './components/TeamSettings';

type Tab = 'profile' | 'security' | 'notifications' | 'team';

export function SettingsClient({ user, merchant, settings, members }: { user: any, merchant: any, settings: any, members: any[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile', label: 'Profil Entreprise' },
    { id: 'security', label: 'Sécurité' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'team', label: "Membres d'équipe" },
  ] as const;

  return (
    <div className="max-w-[1080px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Paramètres</h1>
          <p className="text-text-secondary text-body-sm mt-1">Gérez les préférences de votre compte et de votre entreprise.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-body-sm transition-colors ${
                activeTab === tab.id 
                  ? 'bg-surface-container-high text-text-primary' 
                  : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && <ProfileSettings user={user} merchant={merchant} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings settings={settings} />}
          {activeTab === 'team' && <TeamSettings members={members} />}
        </div>
      </div>
    </div>
  );
}
