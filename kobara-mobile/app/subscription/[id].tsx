import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CalendarClock, CreditCard } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

import { paymentsService, MobileSubscription } from '../../services/payments';
import { balanceService } from '../../services/balance';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { apiClient } from '../../api/client';
import ENV from '../../config/env';

export default function SubscriptionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [subscription, setSubscription] = useState<MobileSubscription | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subRes, balRes] = await Promise.all([
        paymentsService.getSubscriptionDetails(id as string),
        balanceService.getBalance()
      ]);
      setSubscription(subRes.subscription);
      setBalance(balRes.success ? balRes.balance.available_balance : 0);
    } catch (err) {
      console.error("Error fetching subscription details:", err);
      Alert.alert("Erreur", "Impossible de charger l'abonnement.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRenew = async () => {
    if (!subscription) return;

    if (balance !== null && balance >= subscription.amount) {
      // Prompt to pay with balance
      Alert.alert(
        "Renouvellement",
        `Voulez-vous utiliser votre solde de ${balance.toLocaleString('fr-FR')} HTG pour payer cet abonnement de ${subscription.amount.toLocaleString('fr-FR')} HTG ?`,
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Oui, utiliser mon solde", 
            onPress: async () => {
              try {
                setIsRenewing(true);
                const res = await apiClient.post(`/mobile/subscriptions/${id}/renew-balance`);
                if (res.data.success) {
                  Alert.alert("Succès", "Votre abonnement a été renouvelé avec succès !");
                  fetchData();
                } else {
                  Alert.alert("Erreur", res.data.error || "Une erreur est survenue.");
                }
              } catch (e: any) {
                Alert.alert("Erreur", e.response?.data?.error || "Une erreur est survenue.");
              } finally {
                setIsRenewing(false);
              }
            }
          }
        ]
      );
    } else {
      // Pay via web
      try {
        setIsRenewing(true);
        const accessToken = await SecureStore.getItemAsync('kobara_access_token');
        const refreshToken = await SecureStore.getItemAsync('kobara_refresh_token');
        
        const baseUrl = ENV.WEB_URL || 'https://kobara.app';
        let url = `${baseUrl}/dashboard/billing`;

        if (accessToken) {
          url = `${baseUrl}/api/auth/mobile-sso?next=/dashboard/billing&access_token=${accessToken}`;
        }

        await WebBrowser.openBrowserAsync(url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET
        });
        
        // Refresh data when returning from browser
        fetchData();
      } catch (e) {
        console.error("Error opening browser:", e);
      } finally {
        setIsRenewing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0F1C] justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0F1C]">
        <View className="p-4 flex-row items-center border-b border-white/10">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[#121A2F] rounded-full items-center justify-center border border-white/5">
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg ml-4">Retour</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white font-medium">Abonnement introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = subscription.next_billing_date 
    ? new Date(subscription.next_billing_date).toLocaleDateString('fr-FR')
    : 'Non défini';

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1C]">
      {/* Header */}
      <View className="p-4 flex-row items-center justify-between border-b border-white/10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-[#121A2F] rounded-full items-center justify-center border border-white/5"
        >
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Détails de l'abonnement</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 rounded-full bg-purple-500/10 items-center justify-center mb-4">
            <CalendarClock size={40} color="#A855F7" />
          </View>
          <Text className="text-white font-black text-3xl mb-2 text-center">
            {subscription.plans?.name || 'Abonnement'}
          </Text>
          <StatusBadge status={subscription.status} />
        </View>

        <View className="bg-[#121A2F] rounded-2xl border border-white/5 p-5 mb-6">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
            <Text className="text-slate-400 font-medium">Montant</Text>
            <Text className="text-white font-bold">
              {Number(subscription.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {subscription.currency} / {subscription.billing_interval}
            </Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-white/5">
            <Text className="text-slate-400 font-medium">Date de création</Text>
            <Text className="text-white font-bold">{new Date(subscription.created_at).toLocaleDateString('fr-FR')}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-slate-400 font-medium">Prochain prélèvement</Text>
            <Text className="text-white font-bold">{formattedDate}</Text>
          </View>
        </View>

        <Text className="text-slate-400 font-medium mb-3 ml-2 uppercase text-xs tracking-wider">Actions</Text>
        <View className="bg-[#121A2F] rounded-2xl border border-white/5 overflow-hidden mb-8">
          <TouchableOpacity 
            onPress={handleRenew}
            disabled={isRenewing}
            className="flex-row items-center p-4 active:bg-white/5"
          >
            <View className="w-10 h-10 rounded-full bg-orange-500/10 items-center justify-center mr-4">
              {isRenewing ? <ActivityIndicator size="small" color="#F97316" /> : <CreditCard size={20} color="#F97316" />}
            </View>
            <View className="flex-1">
              <Text className="text-orange-500 font-medium text-base">Renouveler l'abonnement</Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                {balance !== null && balance >= subscription.amount 
                  ? 'Payer avec votre solde'
                  : 'Payer via le site web'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
