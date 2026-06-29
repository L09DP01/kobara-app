import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Vérification auth mobile
    const authResult = await verifyMobileToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    const userId = authResult.payload?.sub;
    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non identifié", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    const merchantId = merchant?.id;
    if (!merchantId) {
      return NextResponse.json({ error: "Profil marchand requis", code: "MERCHANT_REQUIRED" }, { status: 403 });
    }

    // 2. Vérifier l'abonnement
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: "Abonnement introuvable", code: "NOT_FOUND" }, { status: 404 });
    }

    if (subscription.amount_htg <= 0) {
      return NextResponse.json({ error: "Ce plan est gratuit.", code: "INVALID_AMOUNT" }, { status: 400 });
    }

    // 3. Générer le code NatCash
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const getRandom = (charset: string) => charset[Math.floor(Math.random() * charset.length)];
    
    // Format: KOB + 5 chars
    const referenceCode = 'KOB' + getRandom(digits) + getRandom(letters) + getRandom(digits) + getRandom(letters) + getRandom(digits);

    // 4. Insérer une intention de paiement dans `payments`
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // Expire in 30 mins
    
    const { data: paymentIntent, error: insertError } = await supabase.from('payments').insert({
      merchant_id: merchantId,
      amount: subscription.amount_htg,
      net_amount: subscription.amount_htg,
      currency: 'HTG',
      status: 'pending',
      provider: 'natcash',
      payment_method: 'natcash',
      reference_code: referenceCode,
      expires_at: expiresAt,
      metadata: {
        is_subscription_upgrade: true,
        plan_slug: subscription.plans?.slug || '',
        billing_cycle: subscription.billing_cycle || 'monthly'
      }
    }).select('id').single();

    if (insertError || !paymentIntent) {
      throw new Error("Erreur lors de l'initialisation du paiement NatCash.");
    }

    return NextResponse.json({
      success: true,
      referenceCode,
      paymentId: paymentIntent.id
    });

  } catch (error: any) {
    console.error("Renew NatCash API error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
