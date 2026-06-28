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

  const provider = formData.get('provider') as string || 'moncash'; // 'moncash' or 'natcash'

  if (!paymentLinkId || !merchantId || !amountStr || !customerName || !customerPhone) {
    throw new Error("Informations manquantes");
  }

  // 1. Fetch Payment Link to check settings
  const { data: linkInfo } = await supabaseAdmin
    .from('payment_links')
    .select('amount, metadata, environment, slug')
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
    grossAmount = parseFloat((baseAmount / (1 - feePercent)).toFixed(2));
    feeAmount = parseFloat((grossAmount - baseAmount).toFixed(2));
    netAmount = baseAmount;
  } else {
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
    await supabaseAdmin.from('customers').update({ name: customerName }).eq('id', customerId);
  } else {
    const { data: newCustomer, error: createError } = await supabaseAdmin
      .from('customers')
      .insert({
        merchant_id: merchantId,
        name: customerName,
        phone: customerPhone,
        wallet: customerPhone,
        environment: linkInfo.environment
      })
      .select('id')
      .single();
      
    if (newCustomer) {
      customerId = newCustomer.id;
    } else {
      console.error("Erreur création client public", createError);
    }
  }

  // 1.5 Fetch Merchant name for reference code prefix
  const { data: merchantData } = await supabaseAdmin.from('merchants').select('business_name').eq('id', merchantId).single();
  const businessName = merchantData?.business_name || 'KBR';
  const prefix = businessName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'X');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) { randomPart += chars.charAt(Math.floor(Math.random() * chars.length)); }
  const referenceCode = prefix + randomPart;

  // 2. Create Payment Record (Pending)
  const externalRef = crypto.randomUUID();
  const txRef = 'TX_' + Math.floor(Date.now() / 1000) + '_' + Math.floor(Math.random() * 1000);
  
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiration

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      merchant_id: merchantId,
      customer_id: customerId,
      payment_link_id: paymentLinkId,
      kobara_reference: txRef,
      reference_code: referenceCode, // Short code for SMS Gateway
      bazik_transaction_id: externalRef,
      amount: grossAmount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      currency: 'HTG',
      status: 'pending',
      provider: provider, // 'moncash' or 'natcash'
      payment_method: provider,
      environment: linkInfo.environment,
      expires_at: expiresAt,
      metadata: customerAddress ? { address: customerAddress } : {}
    })
    .select('id')
    .single();

  if (paymentError) {
    console.error("Erreur de création de paiement:", paymentError);
    throw new Error("Erreur lors de l'initialisation du paiement");
  }

  const { notifyPaymentCreated } = await import('@/lib/server/notifications');
  try {
    const { data: mData } = await supabaseAdmin.from('merchants').select('email').eq('id', merchantId).single();
    if (mData) {
      await notifyPaymentCreated(merchantId, mData.email, grossAmount, 'HTG');
    }
  } catch(e) { console.error("Notification failed", e); }

  // Determine basePath for redirects based on domain
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isPaySubdomain = host === "pay.kobara.app" || host.startsWith("pay.");
  const basePath = isPaySubdomain ? "" : "/pay";

  // 3. Handle Provider specific logic
  if (provider === 'natcash') {
    // Redirect to NatCash Waiting Screen
    redirect(`${basePath}/${linkInfo.slug || paymentLinkId}/natcash?payment_id=${payment.id}`);
  }

  // --- MONCASH / BAZIK LOGIC ---
  let paymentUrl = '';
  
  try {
    const bazikResponse = await BazikService.createMoncashPayment({
      amount: grossAmount,
      reference: txRef,
      description: `Paiement pour ${customerName}`,
      environment: linkInfo.environment as "test" | "live"
    });

    const bazikData = bazikResponse.data || bazikResponse;
    paymentUrl = bazikData.paymentUrl || bazikData.payment_url || bazikData.checkout_url || bazikData.checkoutUrl || bazikData.redirectUrl || bazikData.redirect_url || bazikData.url || null;
    
    if (!paymentUrl) {
      if (bazikResponse.status === 'success' || bazikResponse.success) {
        await supabaseAdmin.from('payments').update({ status: 'succeeded' }).eq('id', payment.id);
        paymentUrl = `${basePath}/${linkInfo.slug || paymentLinkId}?status=success`;
      } else {
        throw new Error("L'API de paiement n'a pas retourné de lien.");
      }
    }
  } catch (error) {
    console.error("Erreur d'initialisation Bazik:", error);
    await supabaseAdmin.from('payments').delete().eq('id', payment.id);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Erreur avec le fournisseur Bazik : ${errorMessage}`);
  }

  // Redirection vers la page de paiement MonCash
  redirect(paymentUrl);
}
