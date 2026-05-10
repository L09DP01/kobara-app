"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BazikService } from "@/lib/server/bazik/bazik.service";

export async function processPayment(formData: FormData) {
  // Use admin client to bypass RLS for public operations
  const supabaseAdmin = createAdminClient();

  const paymentLinkId = formData.get('paymentLinkId') as string;
  const merchantId = formData.get('merchantId') as string;
  const amountStr = formData.get('amount') as string;
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;

  if (!paymentLinkId || !merchantId || !amountStr || !customerName || !customerPhone) {
    throw new Error("Informations manquantes");
  }

  const amount = parseFloat(amountStr);
  const feeAmount = parseFloat((amount * 0.029).toFixed(2));
  const netAmount = parseFloat((amount - feeAmount).toFixed(2));

  // 1. Create Customer
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .insert({
      merchant_id: merchantId,
      name: customerName,
      phone: customerPhone
    })
    .select('id')
    .single();

  // Si on n'arrive pas à insérer (à cause de RLS), on continue sans l'ID client pour l'instant
  const customerId = customer ? customer.id : null;

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
      amount: amount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      currency: 'HTG',
      status: 'pending',
      provider: 'moncash',
      payment_method: 'moncash'
    })
    .select('id')
    .single();

  if (paymentError) {
    console.error("Erreur de création de paiement:", paymentError);
    // On simule une erreur
    throw new Error("Erreur lors de l'initialisation du paiement");
  }

  // 3. Appel à Bazik pour initialiser le paiement MonCash
  let paymentUrl = '';
  
  try {
    const bazikResponse = await BazikService.createMoncashPayment({
      amount: amount,
      reference: txRef,
      description: `Paiement pour ${customerName}`
    });

    // Cherche l'URL dans la réponse de Bazik
    paymentUrl = bazikResponse.redirectUrl || bazikResponse.url || bazikResponse.payment_url || bazikResponse.checkout_url || bazikResponse.redirect_url;
    
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
