import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Bell, ArrowDownToLine, Send, ShieldAlert, Megaphone } from 'lucide-react-native';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    payments: true,
    withdrawals: true,
    transfers: true,
    security: true,
    marketing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const NotificationToggle = ({ icon: Icon, title, subtitle, settingKey }: any) => (
    <View className="py-4 flex-row items-center justify-between border-b border-white/5">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
          <Icon size={20} color="#F97316" />
        </View>
        <View className="ml-3 flex-1 pr-4">
          <Text className="text-white font-medium">{title}</Text>
          <Text className="text-slate-400 text-xs mt-1">{subtitle}</Text>
        </View>
      </View>
      <Switch 
        value={settings[settingKey as keyof typeof settings]} 
        onValueChange={() => toggleSetting(settingKey as keyof typeof settings)}
        trackColor={{ false: "#374151", true: "#F97316" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-[#0A0F1C] px-6 pt-4">
      <Text className="text-slate-400 mb-6">
        Gérez quelles alertes push vous souhaitez recevoir sur cet appareil.
      </Text>

      <View className="bg-[#121A2F] rounded-2xl px-4 mb-10">
        <NotificationToggle 
          icon={ArrowDownToLine} 
          title="Paiements reçus" 
          subtitle="Être notifié à chaque nouveau paiement client"
          settingKey="payments" 
        />
        <NotificationToggle 
          icon={Bell} 
          title="Retraits" 
          subtitle="Alertes sur le statut de vos demandes de retrait"
          settingKey="withdrawals" 
        />
        <NotificationToggle 
          icon={Send} 
          title="Transferts" 
          subtitle="Notifications lors de transferts vers d'autres marchands"
          settingKey="transfers" 
        />
        <NotificationToggle 
          icon={ShieldAlert} 
          title="Sécurité du compte" 
          subtitle="Alertes de connexion et modifications de sécurité"
          settingKey="security" 
        />
        <View className="border-b-0">
          <NotificationToggle 
            icon={Megaphone} 
            title="Marketing et nouveautés" 
            subtitle="Actualités, nouvelles fonctionnalités et offres"
            settingKey="marketing" 
          />
        </View>
      </View>
    </ScrollView>
  );
}
