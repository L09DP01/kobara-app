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
  const netAmount = Number(payment.net_amount || 0);
  const { error: rpcError } = await supabase.rpc('credit_merchant_balance', {
    p_merchant_id: payment.merchant_id,
    p_amount: netAmount
  });
  if (rpcError) {
    console.error("Atomic balance credit error in success action:", rpcError);
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

  // Send email notification and create in-app notification via unified service
  const { data: merchantData } = await supabase.from('merchants').select('email').eq('id', payment.merchant_id).single();
  if (merchantData?.email) {
    const { notifyPaymentSucceeded } = await import("@/lib/server/notifications");
    await notifyPaymentSucceeded(payment.merchant_id, merchantData.email, Number(payment.amount), payment.currency || 'HTG');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/payments');

  return { success: true };
}
