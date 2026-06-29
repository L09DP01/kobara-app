import { apiClient } from '@/api/client';

export interface MobileActivityItem {
  id: string;
  type: 'withdrawal' | 'transfer_sent' | 'transfer_received';
  title: string;
  amount: number;
  amount_type: 'positive' | 'negative';
  status: 'pending' | 'completed' | 'succeeded' | 'failed';
  date: string;
}

export interface BalanceResponse {
  success: boolean;
  balance: number;
  currency: string;
  history: MobileActivityItem[];
}

class BalanceService {
  async getBalance(): Promise<BalanceResponse> {
    const response = await apiClient.get<BalanceResponse>('/mobile/balance');
    return response.data;
  }
}

export const balanceService = new BalanceService();
export default balanceService;
