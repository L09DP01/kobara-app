import { activateFreePlanAfterKyc, getMerchantCurrentPlan } from "./plans";
import { getMonthlyPaymentCount, getDailyWithdrawalTotal, getApiKeysCount } from "./usage";

export async function getMerchantAccess(merchantId: string) {
  return await getMerchantCurrentPlan(merchantId);
}

export async function ensureCanUseLiveMode(merchantId: string, environment: 'test' | 'live') {
  let { merchant, plan } = await getMerchantAccess(merchantId);

  if (environment === 'live') {
    if (merchant.kyc_status !== 'approved') {
      throw new Error('kyc_required');
    }

    // Assign Free plan automatically as a fallback if they don't have one
    if (merchant.plan_status !== 'active' || !plan) {
      try {
        await activateFreePlanAfterKyc(merchantId);
        const updatedAccess = await getMerchantAccess(merchantId);
        merchant = updatedAccess.merchant;
        plan = updatedAccess.plan;
      } catch (e) {
        console.error("Failed to auto-assign free plan in ensureCanUseLiveMode:", e);
      }
    }
  }

  return { merchant, plan };
}

export async function canCreatePayment(merchantId: string, environment: 'test' | 'live'): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { plan } = await ensureCanUseLiveMode(merchantId, environment);

    if (environment === 'live' && plan && plan.monthly_payment_limit !== null) {
      const currentCount = await getMonthlyPaymentCount(merchantId);
      if (currentCount >= plan.monthly_payment_limit) {
        return { allowed: false, reason: 'payment_limit_reached' };
      }
    }

    return { allowed: true };
  } catch (err: any) {
    if (err.message === 'kyc_required') return { allowed: false, reason: 'kyc_required' };
    throw err;
  }
}

export async function canCreateApiKey(merchantId: string, environment: 'test' | 'live'): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { plan } = await ensureCanUseLiveMode(merchantId, environment);

    const limit = plan && plan.api_keys_limit !== null ? plan.api_keys_limit : 1;
    
    if (limit !== null) {
      const currentCount = await getApiKeysCount(merchantId);
      if (currentCount >= limit) {
        return { allowed: false, reason: 'api_key_limit_reached' };
      }
    }

    return { allowed: true };
  } catch (err: any) {
    if (err.message === 'kyc_required') return { allowed: false, reason: 'kyc_required' };
    throw err;
  }
}

export async function canCreateWithdrawal(merchantId: string, amount: number): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { plan } = await ensureCanUseLiveMode(merchantId, 'live');

    if (plan && plan.daily_withdrawal_limit !== null) {
      const currentDailyTotal = await getDailyWithdrawalTotal(merchantId);
      if ((currentDailyTotal + amount) > plan.daily_withdrawal_limit) {
        return { allowed: false, reason: 'withdrawal_limit_reached' };
      }
    }

    return { allowed: true };
  } catch (err: any) {
    if (err.message === 'kyc_required') return { allowed: false, reason: 'kyc_required' };
    throw err;
  }
}
