// Dashboard Mobile Service
export interface DashboardPayment {
  id: string;
  amount: number;
  net_amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'expired' | 'refunded';
  provider: string;
  created_at: string;
  kobara_reference: string;
  customers: { name: string } | null;
}

export interface DashboardStats {
  total_collected: number;
  monthly_growth: number;
  available_balance: number;
  pending_amount: number;
  success_rate: number;
  success_rate_growth: number;
  failed_rate: number;
  failed_rate_growth: number;
  currency: string;
}

export interface DashboardMerchant {
  id: string;
  business_name: string;
  logo_url: string | null;
}

export interface DashboardSummaryResponse {
  success: boolean;
  merchant: DashboardMerchant;
  stats: DashboardStats;
  recentPayments: DashboardPayment[];
  unreadNotifications: number;
  error?: string;
  code?: string;
}

import { storage as SecureStore } from '@/utils/storage';
import Constants from 'expo-constants';
import { apiClient } from '@/api/client';

const getBaseUrl = () => {
  return Constants?.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'https://kobara.app';
};

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const token = await SecureStore.getItemAsync('kobara_access_token');
  
  if (!token) {
    throw new Error('Non autorisé. Veuillez vous reconnecter.');
  }

  const response = await apiClient.get<DashboardSummaryResponse>('/mobile/dashboard/summary');
  
  if (response.data.error) {
    throw new Error(response.data.error || 'Erreur lors de la récupération des données.');
  }
  
  return response.data;
}
