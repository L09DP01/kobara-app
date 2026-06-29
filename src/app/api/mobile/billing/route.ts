import { NextRequest, NextResponse } from "next/server";
import { getMobileSession } from "@/lib/server/auth";
import { getMerchantCurrentPlan } from "@/lib/server/plans";
import { getMonthlyPaymentCount, getDailyWithdrawalTotal, getApiKeysCount } from "@/lib/server/usage";

export async function GET(request: NextRequest) {
  try {
    const merchant = await getMobileSession(request);

    const { plan, subscription, merchant: merchantData } = await getMerchantCurrentPlan(merchant.id);
    
    // Get usage stats
    const paymentsCount = await getMonthlyPaymentCount(merchant.id);
    const withdrawalsTotal = await getDailyWithdrawalTotal(merchant.id);
    const apiKeysCount = await getApiKeysCount(merchant.id);

    return NextResponse.json({
      data: {
        plan,
        subscription,
        merchant: merchantData,
        usage: {
          monthly_payments: paymentsCount,
          daily_withdrawals: withdrawalsTotal,
          api_keys: apiKeysCount
        }
      }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
