import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

/**
 * Centralized handler for when a payment succeeds.
 * Handles:
 * 1. Updating merchant balance
 * 2. Sending signed webhooks to merchant endpoints
 * 3. Sending notifications
 * 4. Upgrading plans (if subscription payment)
 * 
 * This should be called from ALL payment confirmation paths:
 * - Bazik webhook (MonCash)
 * - NatCash SMS webhook
 * - verify-natcash (manual TransCode)
 * - claim-transcode (client TransCode)
 */
export async function onPaymentSucceeded(paymentId: string) {
  const supabase = createAdminClient();

  // Fetch the full payment
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (fetchError || !payment) {
    console.error(`onPaymentSucceeded: Payment ${paymentId} not found`, fetchError);
    return;
  }

  // Guard: only process if payment is actually succeeded
  if (payment.status !== 'succeeded') {
    console.warn(`onPaymentSucceeded: Payment ${paymentId} status is ${payment.status}, skipping`);
    return;
  }

  const merchantId = payment.merchant_id;

  // --- 1. Check if it's a subscription upgrade ---
  const metadata = payment.metadata as any;
  if (metadata && metadata.is_subscription_upgrade && metadata.plan_slug) {
    const { upgradeMerchantPlan } = await import("@/lib/server/plans");
    try {
      await upgradeMerchantPlan(merchantId, metadata.plan_slug);
      console.log(`Plan upgraded: Merchant ${merchantId} to ${metadata.plan_slug}`);

      if (metadata.promo_code_id) {
        // Incrémenter le nombre d'utilisations du code promo
        const { error: promoError } = await supabase.rpc('increment_promo_code_uses', { p_id: metadata.promo_code_id });
        if (promoError) {
           // Fallback si la fonction RPC n'existe pas encore
           const { data: promo } = await supabase.from('promo_codes').select('current_uses').eq('id', metadata.promo_code_id).single();
           if (promo) {
              await supabase.from('promo_codes').update({ current_uses: promo.current_uses + 1 }).eq('id', metadata.promo_code_id);
           }
        }
      }
    } catch (err) {
      console.error(`Plan upgrade failed for ${merchantId}:`, err);
    }
    // Don't send merchant webhooks for internal subscription payments
    return;
  }

  // --- 2. Update Merchant Balance ---
  try {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('available_balance, available_balance_test')
      .eq('id', merchantId)
      .single();

    if (merchant) {
      const isTest = payment.environment === 'test';
      const currentBalance = isTest
        ? Number(merchant.available_balance_test || 0)
        : Number(merchant.available_balance || 0);
      const netAmount = Number(payment.net_amount || 0);

      const updateData = isTest
        ? { available_balance_test: currentBalance + netAmount }
        : { available_balance: currentBalance + netAmount };

      const { error: balanceError } = await supabase
        .from('merchants')
        .update(updateData)
        .eq('id', merchantId);

      if (balanceError) {
        console.error("Balance update error:", balanceError);
      }
    }
  } catch (e) {
    console.error("Balance update failed:", e);
  }

  // --- 3. Send Notification ---
  try {
    const { data: merchantData } = await supabase
      .from('merchants')
      .select('email')
      .eq('id', merchantId)
      .single();

    if (merchantData?.email) {
      const { notifyPaymentSucceeded } = await import("@/lib/server/notifications");
      await notifyPaymentSucceeded(merchantId, merchantData.email, Number(payment.amount), payment.currency || 'HTG', payment.id);
    }
  } catch (e) {
    console.error("Notification failed:", e);
  }

  // --- 4. Send Signed Webhooks to Merchant Endpoints ---
  try {
    const { data: endpoints } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'active');

    if (endpoints && endpoints.length > 0) {
      const timestamp = Math.floor(Date.now() / 1000);
      
      const eventPayload = {
        event_type: 'payment.succeeded',
        timestamp,
        data: {
          id: payment.id,
          reference: payment.kobara_reference,
          amount: payment.amount,
          net_amount: payment.net_amount,
          fee_amount: payment.fee_amount,
          currency: payment.currency,
          status: 'succeeded',
          provider: payment.provider,
          payment_method: payment.payment_method,
          paid_at: payment.paid_at,
          metadata: payment.metadata,
          customer_id: payment.customer_id,
        }
      };

      const payloadString = JSON.stringify(eventPayload);

      for (const endpoint of endpoints) {
        try {
          // Create HMAC signature: t=timestamp,v1=hmac
          const hmac = crypto.createHmac('sha256', endpoint.secret)
            .update(`${timestamp}.${payloadString}`)
            .digest('hex');
          
          const signature = `t=${timestamp},v1=${hmac}`;

          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Kobara-Signature': signature,
              'Kobara-Event': eventPayload.event_type,
              'Kobara-Timestamp': timestamp.toString(),
            },
            body: payloadString,
            signal: AbortSignal.timeout(10000), // 10s timeout
          });

          // Log webhook delivery
          await supabase.from('webhook_events').insert({
            merchant_id: merchantId,
            event_type: eventPayload.event_type,
            payload: eventPayload,
            delivery_status: response.ok ? 'delivered' : 'failed',
            retry_count: 0,
          });

          if (!response.ok) {
            console.error(`Webhook delivery failed to ${endpoint.url}: ${response.status}`);
          }
        } catch (err) {
          console.error(`Failed to send webhook to ${endpoint.url}:`, err);
          
          // Log failed delivery
          try {
            await supabase.from('webhook_events').insert({
              merchant_id: merchantId,
              event_type: eventPayload.event_type,
              payload: eventPayload,
              delivery_status: 'failed',
              retry_count: 0,
            });
          } catch (_) { /* ignore logging errors */ }
        }
      }
    }
  } catch (e) {
    console.error("Webhook dispatch failed:", e);
  }
}
