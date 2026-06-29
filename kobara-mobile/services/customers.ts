import { apiClient } from '@/api/client';

export interface MobileCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpent: number;
  transactionCount: number;
  createdAt: string;
  lastPaymentAt: string | null;
}

export interface CustomersSummary {
  totalClients: number;
  activeClients: number;
  newClients: number;
}

export interface CustomersResponse {
  success: boolean;
  summary: CustomersSummary;
  customers: MobileCustomer[];
}

class CustomersService {
  async getCustomers(): Promise<CustomersResponse> {
    const response = await apiClient.get<CustomersResponse>('/mobile/customers');
    return response.data;
  }
}

export const customersService = new CustomersService();
export default customersService;
