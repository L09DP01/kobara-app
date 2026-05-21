import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createAdminClient } from "@/utils/supabase/admin";
import { upgradeMerchantPlan } from "@/lib/server/plans";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planSlug } = await request.json();
    if (!planSlug) {
      return NextResponse.json({ error: "planSlug is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, kyc_status')
      .eq('user_id', (session.user as any).id)
      .single();

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    if (merchant.kyc_status !== 'approved') {
      return NextResponse.json({ error: "Le KYC doit être approuvé pour choisir un plan" }, { status: 403 });
    }

    const { data: plan } = await supabase
      .from('plans')
      .select('price_htg, name')
      .eq('slug', planSlug)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
    }

    // Si le plan est payant, on génère une session de paiement Bazik
    if (plan.price_htg > 0) {
      const { BazikService } = await import("@/lib/server/bazik/bazik.service");
      const reference = `UPGRADE::${merchant.id}::${planSlug}::${Date.now()}`;
      
      const bazikResponse = await BazikService.createMoncashPayment({
        amount: plan.price_htg,
        reference: reference,
        description: `Abonnement Kobara - Plan ${plan.name}`
      });

      const paymentUrl = bazikResponse.redirectUrl || bazikResponse.url || bazikResponse.payment_url || bazikResponse.checkout_url || bazikResponse.redirect_url;
      
      if (!paymentUrl) {
        throw new Error("L'API de paiement n'a pas retourné d'URL de redirection.");
      }

      // Renvoyer l'URL de paiement au front pour rediriger le client
      return NextResponse.json({ 
        success: true, 
        requiresPayment: true, 
        paymentUrl 
      });
    }

    // Si c'est le plan "Free" ou prix à 0, upgrade direct
    await upgradeMerchantPlan(merchant.id, planSlug);

    return NextResponse.json({ success: true, requiresPayment: false, message: `Plan mis à jour avec succès vers ${planSlug}` });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
