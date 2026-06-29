import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../services/api';

export default function AccountInfoScreen() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const res = await apiClient.get('/mobile/merchants/me');
        if (res.data.success) {
          setMerchant(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching merchant me:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchant();
  }, []);

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View className="py-4 border-b border-white/5">
      <Text className="text-slate-400 text-xs mb-1">{label}</Text>
      <Text className="text-white text-base font-medium">{value}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-[#0A0F1C] px-6 pt-4">
      <Text className="text-slate-400 mb-6">
        Informations enregistrées pour votre compte marchand.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" className="mt-10" />
      ) : merchant ? (
        <View className="bg-[#121A2F] rounded-2xl px-4 py-2 mb-10">
          <InfoRow label="Nom de l'entreprise" value={merchant.business_name || 'Non défini'} />
          <InfoRow label="Email" value={merchant.email || 'Non défini'} />
          <InfoRow label="Téléphone" value={merchant.phone || 'Non défini'} />
          <InfoRow label="Catégorie" value={merchant.category || 'Non définie'} />
          <InfoRow label="Pays" value={merchant.country || 'Haïti'} />
          <InfoRow label="Devise de base" value={merchant.default_currency || 'HTG'} />
          <View className="py-4">
            <Text className="text-slate-400 text-xs mb-1">Date de création</Text>
            <Text className="text-white text-base font-medium">
              {new Date(merchant.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      ) : (
        <Text className="text-white text-center mt-10">Impossible de charger les informations.</Text>
      )}
    </ScrollView>
  );
}
