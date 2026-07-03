import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { upgradeMerchantPlan } from "@/lib/server/plans";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planSlug, billingCycle = 'monthly', paymentMethod = 'moncash', promoCode } = await request.json();
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
      .select('id, price_htg, name')
      .eq('slug', planSlug)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
    }

    let discountPercentage = 0;
    let promoCodeId = null;

    if (promoCode) {
      const { data: promoData } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode)
        .single();
      
      if (!promoData) {
        return NextResponse.json({ error: "Code promo invalide" }, { status: 400 });
      }
      if (!promoData.is_active) {
        return NextResponse.json({ error: "Code promo inactif" }, { status: 400 });
      }
      if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
        return NextResponse.json({ error: "Code promo expiré" }, { status: 400 });
      }
      if (promoData.max_uses && promoData.current_uses >= promoData.max_uses) {
        return NextResponse.json({ error: "Code promo épuisé" }, { status: 400 });
      }
      if (promoData.plan_id && promoData.plan_id !== plan.id) {
        return NextResponse.json({ error: "Code promo non applicable pour ce plan" }, { status: 400 });
      }
      if (promoData.merchant_id && promoData.merchant_id !== merchant.id) {
        return NextResponse.json({ error: "Code promo non applicable pour votre compte" }, { status: 400 });
      }
      if (billingCycle === 'yearly' && !promoData.is_cumulable) {
        return NextResponse.json({ error: "Ce code promo n'est pas cumulable avec l'offre annuelle" }, { status: 400 });
      }
      discountPercentage = promoData.discount_percentage;
      promoCodeId = promoData.id;
    }

    // Si le plan est payant
    if (plan.price_htg > 0) {
      let amount = plan.price_htg;
      let descriptionSuffix = "Mensuel";
      
      if (billingCycle === 'yearly') {
        amount = (plan.price_htg * 0.8) * 12; // 20% discount, billed yearly
        descriptionSuffix = "Annuel";
      }

      if (discountPercentage > 0) {
        amount = amount * (1 - (discountPercentage / 100));
        amount = Math.round(amount * 100) / 100;
      }

      if (paymentMethod === 'natcash') {
        // NatCash Logic
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const digits = '23456789';
        const getRandom = (charset: string) => charset[Math.floor(Math.random() * charset.length)];
        
        // Format: e.g. KOB8K3B2
        const referenceCode = 'KOB' + getRandom(digits) + getRandom(letters) + getRandom(digits) + getRandom(letters) + getRandom(digits);

        // Insérer une intention de paiement dans `payments`
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // Expire in 30 mins
        
        const { data: paymentIntent, error: insertError } = await supabase.from('payments').insert({
          merchant_id: merchant.id,
          amount: amount,
          net_amount: amount,
          currency: 'HTG',
          status: 'pending',
          provider: 'natcash',
          payment_method: 'natcash',
          kobara_reference: referenceCode,
          expires_at: expiresAt,
          metadata: {
            is_subscription_upgrade: true,
            plan_slug: planSlug,
            billing_cycle: billingCycle,
            promo_code: promoCode,
            promo_code_id: promoCodeId
          }
        }).select('id').single();

        if (insertError || !paymentIntent) {
          throw new Error("Erreur lors de l'initialisation du paiement NatCash.");
        }

        return NextResponse.json({ 
          success: true, 
          requiresPayment: true, 
          method: 'natcash',
          referenceCode,
          paymentId: paymentIntent.id
        });
      } else {
        // MonCash Logic
        const { BazikService } = await import("@/lib/server/bazik/bazik.service");
        const reference = `UPG::${merchant.id}::${planSlug}::${billingCycle}::${Date.now()}`;
        
        const bazikResponse = await BazikService.createMoncashPayment({
          amount: amount,
          reference: reference,
          description: `Abonnement Kobara - Plan ${plan.name} (${descriptionSuffix})`
        });

        const paymentUrl = bazikResponse.redirectUrl || bazikResponse.url || bazikResponse.payment_url || bazikResponse.checkout_url || bazikResponse.redirect_url;
        
        if (!paymentUrl) {
          throw new Error("L'API de paiement n'a pas retourné d'URL de redirection.");
        }

        return NextResponse.json({ 
          success: true, 
          requiresPayment: true, 
          method: 'moncash',
          paymentUrl 
        });
      }
    }
    // Si c'est le plan "Free" ou prix à 0, upgrade direct
    await upgradeMerchantPlan(merchant.id, planSlug);

    return NextResponse.json({ success: true, requiresPayment: false, message: `Plan mis à jour avec succès vers ${planSlug}` });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
