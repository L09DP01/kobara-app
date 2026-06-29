import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Vérification auth mobile
    const authResult = await verifyMobileToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    const merchantId = authResult.payload?.merchantId;
    if (!merchantId) {
      return NextResponse.json({ error: "Profil marchand requis", code: "MERCHANT_REQUIRED" }, { status: 403 });
    }

    // 2. Vérifier l'abonnement
    const supabase = createAdminClient();
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('id', params.id)
      .eq('merchant_id', merchantId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: "Abonnement introuvable", code: "NOT_FOUND" }, { status: 404 });
    }

    if (subscription.amount_htg <= 0) {
      return NextResponse.json({ error: "Ce plan est gratuit.", code: "INVALID_AMOUNT" }, { status: 400 });
    }

    // 3. Obtenir le Deep Link ou URL de retour de l'app mobile
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || "kobara://payments/success";

    // 4. Générer le paiement MonCash via Bazik
    const { BazikService } = await import("@/lib/server/bazik/bazik.service");
    
    // Le prefix REF:: indique qu'il s'agit d'un renouvellement
    const reference = `RENEW::${subscription.id}::${Date.now()}`;
    
    const bazikResponse = await BazikService.createMoncashPayment({
      amount: subscription.amount_htg,
      reference: reference,
      description: `Renouvellement Abonnement Kobara - Plan ${subscription.plans?.name || ''}`,
      successUrl: returnUrl,
      cancelUrl: returnUrl,
      errorUrl: returnUrl
    });

    const paymentUrl = bazikResponse.redirectUrl || bazikResponse.url || bazikResponse.payment_url || bazikResponse.checkout_url || bazikResponse.redirect_url;
    
    if (!paymentUrl) {
      throw new Error("L'API de paiement n'a pas retourné d'URL de redirection.");
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl
    });

  } catch (error: any) {
    console.error("Renew MonCash API error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
