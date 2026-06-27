import { apiCall } from "./auth"; // Assuming apiCall uses the authenticated client

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

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  // Use the existing apiCall utility which automatically attaches the JWT Bearer token
  const data = await apiCall('/api/mobile/dashboard/summary', 'GET');
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as DashboardSummaryResponse;
}
