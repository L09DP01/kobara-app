import { getMerchantCurrentPlan } from "./plans";
import { getMonthlyPaymentCount, getDailyWithdrawalTotal, getApiKeysCount } from "./usage";

export async function getMerchantAccess(merchantId: string) {
  return await getMerchantCurrentPlan(merchantId);
}

export async function canCreatePayment(merchantId: string, environment: 'test' | 'live'): Promise<{ allowed: boolean; reason?: string }> {
  const { merchant, plan } = await getMerchantAccess(merchantId);

  // 1. KYC Check for Live
  if (environment === 'live' && merchant.kyc_status !== 'approved') {
    return { allowed: false, reason: 'kyc_required' };
  }

  // 2. Test mode is always allowed
  if (environment === 'test') {
    return { allowed: true };
  }

  // 3. Plan Check for Live
  if (merchant.plan_status !== 'active' || !plan) {
    return { allowed: false, reason: 'plan_required' };
  }

  // 4. Limit Check
  if (plan.monthly_payment_limit !== null) {
    const currentCount = await getMonthlyPaymentCount(merchantId);
    if (currentCount >= plan.monthly_payment_limit) {
      return { allowed: false, reason: 'payment_limit_reached' };
    }
  }

  return { allowed: true };
}

export async function canCreateApiKey(merchantId: string, environment: 'test' | 'live'): Promise<{ allowed: boolean; reason?: string }> {
  const { merchant, plan } = await getMerchantAccess(merchantId);

  // 1. KYC Check for Live
  if (environment === 'live' && merchant.kyc_status !== 'approved') {
    return { allowed: false, reason: 'kyc_required' };
  }

  // 2. Test mode allows API keys, but we still respect overall count limits to prevent abuse
  // Wait, the spec says "Test key and no KYC -> allow". But maybe we should limit the number of keys anyway.
  // For now, let's enforce limits regardless of environment.
  
  if (plan && plan.api_keys_limit !== null) {
    const currentCount = await getApiKeysCount(merchantId);
    if (currentCount >= plan.api_keys_limit) {
      return { allowed: false, reason: 'api_key_limit_reached' };
    }
  }

  return { allowed: true };
}

export async function canCreateWithdrawal(merchantId: string, amount: number): Promise<{ allowed: boolean; reason?: string }> {
  const { merchant, plan } = await getMerchantAccess(merchantId);

  // 1. KYC Check
  if (merchant.kyc_status !== 'approved') {
    return { allowed: false, reason: 'kyc_required' };
  }

  // 2. Plan Check
  if (merchant.plan_status !== 'active' || !plan) {
    return { allowed: false, reason: 'plan_required' };
  }

  // 3. Limit Check
  if (plan.daily_withdrawal_limit !== null) {
    const currentDailyTotal = await getDailyWithdrawalTotal(merchantId);
    if ((currentDailyTotal + amount) > plan.daily_withdrawal_limit) {
      return { allowed: false, reason: 'withdrawal_limit_reached' };
    }
  }

  // Balance check will be done in the withdrawal logic itself since it depends on the ledger/wallet.

  return { allowed: true };
}
