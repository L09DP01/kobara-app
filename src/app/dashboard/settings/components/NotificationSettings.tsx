'use client'

import { useState } from 'react';
import { updateNotificationSettings } from '../actions';

export function NotificationSettings({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(settings?.notifications_json || {
    payment_success: true,
    payment_failed: true,
    withdrawal_success: true,
    security_alerts: true
  });

  const handleToggle = (key: string) => {
    setNotifications((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateNotificationSettings(notifications);
      alert("Préférences de notifications sauvegardées !");
    } catch (err: any) {
      alert(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-headline-md font-headline-md text-text-primary mb-1">Préférences de notifications</h2>
          <p className="text-body-sm text-text-secondary">Choisissez les alertes que vous souhaitez recevoir par email.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium text-body-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="space-y-4">
        {[
          { key: 'payment_success', label: 'Paiements réussis', desc: 'Recevoir un email lorsqu\'un client paie avec succès.' },
          { key: 'payment_failed', label: 'Paiements échoués', desc: 'Être alerté lors d\'un échec de paiement.' },
          { key: 'withdrawal_success', label: 'Retraits traités', desc: 'Notification quand un retrait arrive sur votre compte.' },
          { key: 'security_alerts', label: 'Alertes de sécurité', desc: 'Connexions inhabituelles ou changements importants.' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
            <div>
              <h3 className="text-body-base font-medium text-text-primary">{item.label}</h3>
              <p className="text-body-sm text-text-secondary">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications[item.key]} 
                onChange={() => handleToggle(item.key)} 
              />
              <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
