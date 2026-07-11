'use client'

import { useEffect, useState } from 'react';
import { updateNotificationSettings } from '../actions';
import { toast } from "sonner";

type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export function NotificationSettings({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<BrowserNotificationPermission>('unsupported');
  const [notifications, setNotifications] = useState(settings?.notifications_json || {
    payment_success: true,
    payment_failed: true,
    withdrawal_success: true,
    security_alerts: true
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);
  }, []);

  const handleToggle = (key: string) => {
    setNotifications((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnableBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error("Les notifications navigateur ne sont pas supportees sur cet appareil.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success("Notifications PWA activees.");
      new Notification('Kobara', {
        body: 'Les notifications de la PWA sont maintenant actives.',
      });
    } else {
      toast.error("Notifications refusees. Vous pouvez les autoriser depuis les parametres du navigateur.");
    }
  };

  const handleTestBrowserNotification = () => {
    if (permission !== 'granted') {
      toast.error("Activez d'abord les notifications PWA.");
      return;
    }

    new Notification('Kobara', {
      body: 'Notification test: votre PWA peut afficher les alertes.',
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateNotificationSettings(notifications);
      toast.success("Préférences de notifications sauvegardées !");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Préférences de notifications</h2>
          <p className="text-sm text-slate-400">Choisissez les alertes email et activez les notifications de la PWA sur cet appareil.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Notifications PWA</h3>
          <p className="text-sm text-slate-400 mt-1">
            {permission === 'granted'
              ? "Les notifications navigateur sont actives sur cet appareil."
              : permission === 'denied'
                ? "Les notifications sont bloquees dans le navigateur."
                : permission === 'default'
                  ? "Autorisez les notifications pour recevoir les alertes sur la PWA."
                  : "Ce navigateur ne supporte pas les notifications PWA."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleEnableBrowserNotifications}
            disabled={permission === 'unsupported' || permission === 'granted'}
            className="bg-white text-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {permission === 'granted' ? 'Activees' : 'Activer PWA'}
          </button>
          <button
            type="button"
            onClick={handleTestBrowserNotification}
            disabled={permission !== 'granted'}
            className="bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            Tester
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'payment_success', label: 'Paiements réussis', desc: 'Recevoir un email lorsqu\'un client paie avec succès.' },
          { key: 'payment_failed', label: 'Paiements échoués', desc: 'Être alerté lors d\'un échec de paiement.' },
          { key: 'withdrawal_success', label: 'Retraits traités', desc: 'Notification quand un retrait arrive sur votre compte.' },
          { key: 'security_alerts', label: 'Alertes de sécurité', desc: 'Connexions inhabituelles ou changements importants.' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
            <div>
              <h3 className="text-base font-bold text-white">{item.label}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications[item.key]} 
                onChange={() => handleToggle(item.key)} 
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
