import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { authOptions } from "@/lib/auth/auth-options";
import { createAdminClient } from "@/utils/supabase/admin";
import { getMerchantCurrentPlan } from "@/lib/server/plans";
import { getMonthlyPaymentCount, getDailyWithdrawalTotal, getApiKeysCount } from "@/lib/server/usage";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', (session.user as any).id)
      .single();

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

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
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
