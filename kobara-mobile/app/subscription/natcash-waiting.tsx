import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function NatCashWaitingScreen() {
  const { referenceCode, amount } = useLocalSearchParams<{ referenceCode: string, amount: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1C]">
      {/* Header */}
      <View className="p-4 flex-row items-center border-b border-white/10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-[#121A2F] rounded-full items-center justify-center border border-white/5"
        >
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg ml-4">Retour</Text>
      </View>

      <View className="flex-1 p-5 justify-center">
        <View className="bg-[#121A2F] border border-white/10 rounded-3xl p-8 shadow-2xl items-center">
          <View className="w-16 h-16 bg-blue-500/20 rounded-2xl items-center justify-center mb-6">
            <Text className="text-blue-500 font-black text-2xl">NC</Text>
          </View>
          
          <Text className="text-2xl font-bold text-white mb-2 text-center">Paiement NatCash</Text>
          <Text className="text-slate-400 text-sm mb-6 text-center">
            Pour finaliser votre abonnement ({amount} HTG), veuillez effectuer le transfert NatCash depuis votre téléphone :
          </Text>
          
          <View className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 w-full">
            <Text className="text-slate-300 text-sm mb-4 text-center">
              Utilisez votre application NatCash ou faites <Text className="font-bold text-white">*202#</Text> pour faire le transfert du montant.
            </Text>
            <Text className="text-slate-500 text-sm mb-2 text-center">Code de référence à inclure :</Text>
            <Text className="text-2xl sm:text-3xl font-black text-orange-400 tracking-wider text-center selection:bg-orange-500/30">
              {referenceCode}
            </Text>
            <Text className="text-slate-500 text-xs mt-4 text-center">
              Le transfert sera détecté automatiquement. Ne quittez pas cet écran.
            </Text>
          </View>

          <View className="flex-row items-center justify-center mb-6">
            <ActivityIndicator size="small" color="#3B82F6" className="mr-3" />
            <Text className="text-blue-400 font-medium">En attente du transfert SMS...</Text>
          </View>

          <TouchableOpacity 
            onPress={() => {
              // On simule que c'est bon ou l'utilisateur veut juste revenir
              router.replace('/(tabs)/profile');
            }}
            className="w-full py-3.5 bg-white/5 active:bg-white/10 rounded-xl items-center"
          >
            <Text className="text-slate-300 font-bold">Fermer (J'ai payé)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
