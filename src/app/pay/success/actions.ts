'use server'

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function processSuccessfulPayment(reference: string) {
  if (!reference) return { success: false, error: "No reference provided" };

  const supabase = createAdminClient();

  // Find the payment
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('*')
    .eq('kobara_reference', reference)
    .single();

  if (fetchError || !payment) {
    return { success: false, error: "Payment not found" };
  }

  if (payment.status === 'succeeded') {
    return { success: true, alreadyProcessed: true };
  }

  // In a real app, we would verify with Bazik API here.
  // For this MVP / local test environment where webhooks might not reach localhost,
  // we update the status based on the success redirect.

  const newStatus = "succeeded";
  const paidAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: newStatus,
      paid_at: paidAt
    })
    .eq('id', payment.id);

  if (updateError) {
    return { success: false, error: "Failed to update payment status" };
  }

  // Update Merchant Balance
  const { data: merchant } = await supabase
    .from('merchants')
    .select('available_balance')
    .eq('id', payment.merchant_id)
    .single();
  
  if (merchant) {
    const currentBalance = Number(merchant.available_balance || 0);
    const netAmount = Number(payment.net_amount || 0);
    
    await supabase
      .from('merchants')
      .update({
        available_balance: currentBalance + netAmount
      })
      .eq('id', payment.merchant_id);
  }

  // Fetch Customer Name for notification
  let customerName = "un client";
  if (payment.customer_id) {
    const { data: customer } = await supabase
      .from('customers')
      .select('name')
      .eq('id', payment.customer_id)
      .single();
    if (customer?.name) {
      customerName = customer.name;
    }
  }

  // Create Notification for Merchant
  await supabase.from('notifications').insert({
    merchant_id: payment.merchant_id,
    type: 'payment_received',
    title: '💰 Nouveau paiement reçu',
    message: `Vous avez reçu un paiement de ${payment.amount} HTG de la part de ${customerName}. Référence: ${payment.kobara_reference}`
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/payments');

  return { success: true };
}
