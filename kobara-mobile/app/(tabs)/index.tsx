import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { RevenueCard } from '../../components/dashboard/RevenueCard';
import { KPIGrid } from '../../components/dashboard/KPIGrid';
import { RecentPayments } from '../../components/dashboard/RecentPayments';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboardSummary();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    router.push('/notifications' as any); // Assuming notifications screen exists or will be created
  };

  const handleViewAllPayments = () => {
    router.push('/(tabs)/payments' as any);
  };

  const handlePaymentPress = (id: string) => {
    router.push(`/payment/${id}` as any);
  };

  if (isLoading && !refreshing) {
    return (
      <View className="flex-1 bg-[#0A0F1C] justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-white mt-4 font-medium">Chargement du tableau de bord...</Text>
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View className="flex-1 bg-[#0A0F1C] justify-center items-center px-6">
        <Text className="text-white font-bold text-lg mb-2">Oups, une erreur est survenue.</Text>
        <Text className="text-slate-400 text-center mb-6">Nous n'avons pas pu charger vos données. Veuillez vérifier votre connexion.</Text>
        <TouchableOpacity 
          onPress={() => refetch()}
          className="bg-[#F97316] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <DashboardHeader 
        merchant={data?.merchant} 
        unreadCount={data?.unreadNotifications} 
        onNotificationPress={handleNotificationPress} 
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
            colors={['#F97316']}
          />
        }
      >
        <RevenueCard stats={data?.stats} />
        <KPIGrid stats={data?.stats} />
        <RecentPayments 
          payments={data?.recentPayments} 
          onViewAll={handleViewAllPayments}
          onPaymentPress={handlePaymentPress}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#F97316] rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#F97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}
        onPress={() => {
          // Open quick actions (bottom sheet or new link screen)
          console.log('Open create link');
        }}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
}
