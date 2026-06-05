"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BazikService } from "@/lib/server/bazik/bazik.service";
import { getMerchantCurrentPlan } from "@/lib/server/plans";

export async function processPayment(formData: FormData) {
  // Use admin client to bypass RLS for public operations
  const supabaseAdmin = createAdminClient();

  const paymentLinkId = formData.get('paymentLinkId') as string;
  const merchantId = formData.get('merchantId') as string;
  const amountStr = formData.get('amount') as string;
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerAddress = formData.get('customerAddress') as string;

  if (!paymentLinkId || !merchantId || !amountStr || !customerName || !customerPhone) {
    throw new Error("Informations manquantes");
  }

  // 1. Fetch Payment Link to check settings
  const { data: linkInfo } = await supabaseAdmin
    .from('payment_links')
    .select('amount, metadata')
    .eq('id', paymentLinkId)
    .single();

  if (!linkInfo) {
    throw new Error("Lien de paiement invalide");
  }

  // Determine base amount (if link has a fixed amount, use it to avoid tampering)
  const baseAmount = linkInfo.amount ? Number(linkInfo.amount) : parseFloat(amountStr);

  if (isNaN(baseAmount) || baseAmount < 10) {
    throw new Error("Montant invalide. Le montant minimum est de 10 HTG.");
  }
  
  const { plan } = await getMerchantCurrentPlan(merchantId);
  const feePercent = plan ? (plan.transaction_fee_percent / 100) : 0.04; // Default to 4% if no plan
  
  const passFeesToCustomer = linkInfo.metadata?.pass_fees_to_customer === true;

  let grossAmount = baseAmount;
  let feeAmount = 0;
  let netAmount = 0;

  if (passFeesToCustomer) {
    // Customer pays the fee.
    // If base is 100, and fee is 4%, to get 100 net, gross must be 100 / 0.96 = 104.17
    // Alternatively: gross = 100 + (100 * 0.04) = 104. Let's use standard Stripe calculation:
    grossAmount = parseFloat((baseAmount / (1 - feePercent)).toFixed(2));
    feeAmount = parseFloat((grossAmount - baseAmount).toFixed(2));
    netAmount = baseAmount;
  } else {
    // Merchant pays the fee
    feeAmount = parseFloat((baseAmount * feePercent).toFixed(2));
    netAmount = parseFloat((baseAmount - feeAmount).toFixed(2));
    grossAmount = baseAmount;
  }

  // 1. Find or Create Customer
  let customerId = null;
  const { data: existingCustomer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('merchant_id', merchantId)
    .eq('phone', customerPhone)
    .maybeSingle();

  if (existingCustomer) {
    customerId = existingCustomer.id;
    // Update name if different
    await supabaseAdmin.from('customers').update({ name: customerName }).eq('id', customerId);
  } else {
    const { data: newCustomer, error: createError } = await supabaseAdmin
      .from('customers')
      .insert({
        merchant_id: merchantId,
        name: customerName,
        phone: customerPhone,
        wallet: customerPhone
      })
      .select('id')
      .single();
      
    if (newCustomer) {
      customerId = newCustomer.id;
    } else {
      console.error("Erreur création client public", createError);
    }
  }

  // 2. Create Payment Record (Pending)
  const externalRef = crypto.randomUUID();
  const txRef = 'TX_' + Math.floor(Date.now() / 1000) + '_' + Math.floor(Math.random() * 1000);

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      merchant_id: merchantId,
      customer_id: customerId,
      payment_link_id: paymentLinkId,
      kobara_reference: txRef,
      bazik_transaction_id: externalRef,
      amount: grossAmount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      currency: 'HTG',
      status: 'pending',
      provider: 'moncash',
      payment_method: 'moncash',
      metadata: customerAddress ? { address: customerAddress } : {}
    })
    .select('id')
    .single();

  if (paymentError) {
    console.error("Erreur de création de paiement:", paymentError);
    // On simule une erreur
    throw new Error("Erreur lors de l'initialisation du paiement");
  }

  const { notifyPaymentCreated } = await import('@/lib/server/notifications');
  try {
    const { data: mData } = await supabaseAdmin.from('merchants').select('email').eq('id', merchantId).single();
    if (mData) {
      await notifyPaymentCreated(merchantId, mData.email, grossAmount, 'HTG');
    }
  } catch(e) { console.error("Notification failed", e); }

  // 3. Appel à Bazik pour initialiser le paiement MonCash
  let paymentUrl = '';
  
  try {
    const bazikResponse = await BazikService.createMoncashPayment({
      amount: grossAmount,
      reference: txRef,
      description: `Paiement pour ${customerName}`
    });

    // Cherche l'URL dans la réponse de Bazik
    const bazikData = bazikResponse.data || bazikResponse;
    paymentUrl = bazikData.paymentUrl || bazikData.payment_url || bazikData.checkout_url || bazikData.checkoutUrl || bazikData.redirectUrl || bazikData.redirect_url || bazikData.url || null;
    
    if (!paymentUrl) {
      console.error("Réponse Bazik invalide (sans URL):", bazikResponse);
      // Fallback test au cas où Bazik renverrait un succès sans URL en mode dev
      if (bazikResponse.status === 'success' || bazikResponse.success) {
        await supabaseAdmin.from('payments').update({ status: 'succeeded' }).eq('id', payment.id);
        const { data: linkInfo } = await supabaseAdmin.from('payment_links').select('slug, id').eq('id', paymentLinkId).single();
        paymentUrl = `/pay/${linkInfo?.slug || paymentLinkId}?status=success`;
      } else {
        throw new Error("L'API de paiement n'a pas retourné de lien.");
      }
    }
  } catch (error) {
    console.error("Erreur d'initialisation Bazik:", error);
    // Supprimer le paiement pending car il a échoué à l'initialisation
    await supabaseAdmin.from('payments').delete().eq('id', payment.id);
    
    // On extrait le message d'erreur exact pour l'afficher à l'utilisateur
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Erreur avec le fournisseur Bazik : ${errorMessage}`);
  }

  // Redirection vers la page de paiement MonCash (ou fallback succès)
  redirect(paymentUrl);
}
