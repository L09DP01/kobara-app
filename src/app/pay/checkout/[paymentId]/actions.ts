"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { BazikService } from "@/lib/server/bazik/bazik.service";

export async function processUnifiedCheckout(formData: FormData) {
  const supabaseAdmin = createAdminClient();

  const paymentId = formData.get('paymentId') as string;
  const provider = formData.get('provider') as string;

  if (!paymentId || !provider) {
    throw new Error("Informations manquantes");
  }

  // Fetch Payment
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment) {
    throw new Error("Paiement invalide");
  }

  if (payment.status !== 'pending') {
    throw new Error("Ce paiement n'est plus en attente");
  }

  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isPaySubdomain = host === "pay.kobara.app" || host.startsWith("pay.");
  const basePath = isPaySubdomain ? "" : "/pay";

  if (provider === 'natcash') {
    // Generate NatCash Reference Code if not exists
    let natcashReferenceCode = payment.reference_code;
    
    if (!natcashReferenceCode) {
      const { data: merchantData } = await supabaseAdmin.from('merchants').select('business_name').eq('id', payment.merchant_id).single();
      const businessName = merchantData?.business_name || 'KBR';
      const prefix = businessName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'X');
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let randomPart = '';
      for (let i = 0; i < 5; i++) { randomPart += chars.charAt(Math.floor(Math.random() * chars.length)); }
      natcashReferenceCode = prefix + randomPart;

      await supabaseAdmin.from('payments').update({
        provider: 'natcash',
        payment_method: 'natcash',
        reference_code: natcashReferenceCode
      }).eq('id', paymentId);
    }

    redirect(`${basePath}/checkout/${paymentId}/natcash`);
  }

  if (provider === 'moncash') {
    // Process MonCash
    let bazikOrderId = payment.bazik_order_id;
    let paymentUrl = '';

    if (!bazikOrderId) {
      const bazikResponse = await BazikService.createMoncashPayment({
        amount: payment.amount,
        reference: payment.kobara_reference,
        description: "Paiement API Kobara",
        environment: payment.environment as "test" | "live"
      });

      bazikOrderId = bazikResponse.order_id || bazikResponse.id || null;
      const bazikData = bazikResponse.data || bazikResponse;
      paymentUrl = bazikData.paymentUrl || bazikData.payment_url || bazikData.checkout_url || bazikData.checkoutUrl || bazikData.redirectUrl || bazikData.redirect_url || bazikData.url || null;

      await supabaseAdmin.from('payments').update({
        provider: 'moncash',
        payment_method: 'moncash',
        bazik_order_id: bazikOrderId
      }).eq('id', paymentId);
    }

    if (paymentUrl) {
      redirect(paymentUrl);
    } else {
      throw new Error("Impossible de générer le lien MonCash");
    }
  }

  throw new Error("Fournisseur inconnu");
}

export async function simulateTestPayment(formData: FormData) {
  const supabaseAdmin = createAdminClient();
  const paymentId = formData.get('paymentId') as string;

  if (!paymentId) throw new Error("Informations manquantes");

  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment || payment.status !== 'pending' || payment.environment !== 'test') {
    throw new Error("Paiement test invalide");
  }

  // Marquer le paiement comme réussi
  await supabaseAdmin.from('payments').update({
    status: 'succeeded',
    paid_at: new Date().toISOString()
  }).eq('id', paymentId);

  // Pour les tests, on ne déclenche pas le vrai webhook via sendWebhook car le module 
  // n'existe pas ou est géré ailleurs. On marque juste le paiement comme réussi.
  console.log(`Paiement test ${paymentId} simulé avec succès.`);

  if (payment.success_url) {
    redirect(payment.success_url);
  } else {
    redirect(`/pay/checkout/${paymentId}`);
  }
}
