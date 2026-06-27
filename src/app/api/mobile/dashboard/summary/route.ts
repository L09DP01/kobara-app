import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    // 1. Vérification du JWT
    const { payload, errorResponse } = await verifyMobileToken(req);
    
    if (errorResponse) {
      return errorResponse;
    }

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Token invalide." }, { status: 401 });
    }

    const userId = payload.sub;

    // 2. Fetch Merchant Profile
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from("merchants")
      .select("id, user_id, business_name, logo_url, available_balance, pending_balance, current_environment")
      .eq("user_id", userId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: "Profil marchand introuvable.", code: "MERCHANT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const environment = merchant.current_environment || 'test';

    // 3. Fetch Recent Payments (Limit 10)
    const { data: recentPayments } = await supabaseAdmin
      .from('payments')
      .select('id, amount, net_amount, currency, status, provider, created_at, kobara_reference, customers(name)')
      .eq('merchant_id', merchant.id)
      .eq('environment', environment)
      .order('created_at', { ascending: false })
      .limit(10);

    // 4. Aggregate Monthly Stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    // Get all payments for current month to calculate stats
    const { data: monthlyPayments } = await supabaseAdmin
      .from('payments')
      .select('amount, net_amount, status, created_at')
      .eq('merchant_id', merchant.id)
      .eq('environment', environment)
      .gte('created_at', monthStart);

    let totalEncaisse = 0;
    let pendingAmount = 0;
    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;

    if (monthlyPayments) {
      monthlyPayments.forEach(p => {
        const amt = Number(p.net_amount || p.amount || 0);
        if (p.status === 'succeeded') {
          totalEncaisse += amt;
          successCount++;
        } else if (p.status === 'pending') {
          pendingAmount += amt;
          pendingCount++;
        } else if (p.status === 'failed') {
          failedCount++;
        }
      });
    }

    const totalCount = successCount + failedCount + pendingCount;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    const failedRate = totalCount > 0 ? (failedCount / totalCount) * 100 : 0;

    // Get all payments for previous month to calculate growth
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

    const { data: lastMonthPayments } = await supabaseAdmin
      .from('payments')
      .select('amount, net_amount, status, created_at')
      .eq('merchant_id', merchant.id)
      .eq('environment', environment)
      .gte('created_at', lastMonthStart)
      .lte('created_at', lastMonthEnd);

    let lastMonthEncaisse = 0;
    let lastMonthSuccessCount = 0;
    let lastMonthFailedCount = 0;

    if (lastMonthPayments) {
      lastMonthPayments.forEach(p => {
        const amt = Number(p.net_amount || p.amount || 0);
        if (p.status === 'succeeded') {
          lastMonthEncaisse += amt;
          lastMonthSuccessCount++;
        } else if (p.status === 'failed') {
          lastMonthFailedCount++;
        }
      });
    }

    const lastMonthTotalCount = lastMonthSuccessCount + lastMonthFailedCount;
    const lastMonthSuccessRate = lastMonthTotalCount > 0 ? (lastMonthSuccessCount / lastMonthTotalCount) * 100 : 0;
    const lastMonthFailedRate = lastMonthTotalCount > 0 ? (lastMonthFailedCount / lastMonthTotalCount) * 100 : 0;

    const monthlyGrowth = lastMonthEncaisse > 0 ? ((totalEncaisse - lastMonthEncaisse) / lastMonthEncaisse) * 100 : 0;
    const successRateGrowth = successRate - lastMonthSuccessRate;
    const failedRateGrowth = failedRate - lastMonthFailedRate;

    // 5. Fetch Unread Notifications
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .eq('read', false);

    // 6. Format Response
    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        business_name: merchant.business_name,
        logo_url: merchant.logo_url,
      },
      stats: {
        total_collected: totalEncaisse,
        monthly_growth: monthlyGrowth,
        available_balance: Number(merchant.available_balance || 0),
        pending_amount: pendingAmount,
        success_rate: successRate,
        success_rate_growth: successRateGrowth,
        failed_rate: failedRate,
        failed_rate_growth: failedRateGrowth,
        currency: "HTG" // Fixed as per UI requirement
      },
      recentPayments: recentPayments || [],
      unreadNotifications: unreadCount || 0
    });

  } catch (error) {
    console.error("Dashboard summary API error:", error);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
