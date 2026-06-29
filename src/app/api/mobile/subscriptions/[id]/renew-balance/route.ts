import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const { payload, errorResponse } = await verifyMobileToken(req);
    if (errorResponse) return errorResponse;
    if (!payload || !payload.sub) return NextResponse.json({ error: "Token invalide." }, { status: 401 });

    const userId = payload.sub;

    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from("merchants")
      .select("id, available_balance, available_balance_test, current_environment")
      .eq("user_id", userId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Profil marchand introuvable." }, { status: 404 });
    }

    const environment = merchant.current_environment || 'test';
    const isTest = environment === 'test';
    const balance = isTest ? merchant.available_balance_test : merchant.available_balance;

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('merchant_id', merchant.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 });
    }

    const amountHTG = subscription.amount_htg;

    if (balance < amountHTG) {
      return NextResponse.json({ error: "Solde insuffisant pour renouveler l'abonnement." }, { status: 400 });
    }

    // Deduct balance
    const newBalance = Number(balance) - Number(amountHTG);
    const updatePayload = isTest ? { available_balance_test: newBalance } : { available_balance: newBalance };

    const { error: updateMerchantError } = await supabaseAdmin
      .from("merchants")
      .update(updatePayload)
      .eq("id", merchant.id);

    if (updateMerchantError) {
      return NextResponse.json({ error: "Erreur lors de la déduction du solde." }, { status: 500 });
    }

    // Calculate new billing date
    const currentDate = new Date();
    const currentEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : currentDate;
    const nextEnd = new Date(currentEnd > currentDate ? currentEnd : currentDate);
    
    if (subscription.billing_cycle === 'yearly') {
      nextEnd.setFullYear(nextEnd.getFullYear() + 1);
    } else {
      nextEnd.setMonth(nextEnd.getMonth() + 1);
    }

    // Update subscription
    const { error: updateSubError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: 'active',
        current_period_end: nextEnd.toISOString(),
      })
      .eq("id", id);

    if (updateSubError) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour de l'abonnement." }, { status: 500 });
    }

    // Record withdrawal/transaction for ledger
    await supabaseAdmin
      .from("withdrawals")
      .insert({
        merchant_id: merchant.id,
        kobara_reference: `SUB_${randomUUID().substring(0, 8).toUpperCase()}`,
        amount: amountHTG,
        fees: 0,
        total: amountHTG,
        wallet: "Kobara Wallet",
        description: "Renouvellement Abonnement",
        status: "completed",
        environment: environment
      });

    return NextResponse.json({ success: true, new_balance: newBalance, next_billing_date: nextEnd.toISOString() });
  } catch (error: any) {
    console.error("API /mobile/subscriptions/renew error:", error);
    return NextResponse.json({ error: "Erreur serveur interne." }, { status: 500 });
  }
}
