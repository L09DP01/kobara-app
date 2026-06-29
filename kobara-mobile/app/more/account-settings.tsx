import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User, ArrowUpRight, ChevronRight, Store, MapPin } from 'lucide-react-native';

export default function AccountSettingsScreen() {
  const router = useRouter();

  const MenuItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between py-4"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
          <Icon size={20} color="#F97316" />
        </View>
        <View className="ml-4 flex-1 pr-4">
          <Text className="text-white font-medium text-base">{title}</Text>
          {subtitle && (
            <Text className="text-slate-400 text-xs mt-1" numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <ChevronRight size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-[#0A0F1C] px-6 pt-4">
      <Text className="text-slate-400 mb-6">
        Gérez les informations de votre profil et de votre entreprise.
      </Text>

      <View className="bg-[#121A2F] rounded-2xl px-4">
        <MenuItem 
          icon={User} 
          title="Informations du compte" 
          subtitle="Vos informations personnelles et celles de l'entreprise"
          onPress={() => router.push('/more/account-info')} 
        />
        <View className="h-[1px] bg-white/5" />
        <MenuItem 
          icon={ArrowUpRight} 
          title="État du compte" 
          subtitle="Statut de vérification, KYC et limites"
          onPress={() => router.push('/more/account-status')} 
        />
      </View>
    </ScrollView>
  );
}
