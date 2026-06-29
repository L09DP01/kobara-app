import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const { payload, errorResponse } = await verifyMobileToken(req);
    if (errorResponse) return errorResponse;
    if (!payload || !payload.sub) return NextResponse.json({ error: "Token invalide." }, { status: 401 });

    const userId = payload.sub;

    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from("merchants")
      .select("id, business_name")
      .eq("user_id", userId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Profil marchand introuvable." }, { status: 404 });
    }

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, amount:amount_htg, status, billing_interval:billing_cycle, next_billing_date:current_period_end, created_at, plans(name)')
      .eq('id', id)
      .eq('merchant_id', merchant.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 });
    }

    const formattedSubscription = {
      ...subscription,
      currency: 'HTG',
      customers: { name: merchant.business_name }
    };

    return NextResponse.json({ success: true, subscription: formattedSubscription });
  } catch (error: any) {
    console.error("API /mobile/subscriptions/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur interne." }, { status: 500 });
  }
}
