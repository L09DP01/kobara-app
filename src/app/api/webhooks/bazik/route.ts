import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
// For bypassing RLS when saving webhook updates since Bazik request isn't authenticated as a merchant
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("X-Bazik-Signature");
    const rawBody = await request.text();

    const secret = process.env.BAZIK_WEBHOOK_SECRET;
    
    if (!secret || !signature) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 401 });
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    // Bazik might use reference or referenceId
    const reference = body.reference || body.referenceId || body.reference_id;
    const status = body.status;
    const transaction_id = body.transaction_id || body.transactionId || body.id;

    if (!reference) {
      console.error("Webhook error: Missing reference in body", body);
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        getAll() { return [] },
        setAll() { }
      }
    });

    // Intercepter les paiements pour mise à niveau d'abonnement
    if (reference.startsWith('UPGRADE::')) {
      const parts = reference.split('::');
      if (parts.length >= 3) {
        const merchantId = parts[1];
        const planSlug = parts[2];
        const bazikStatus = String(status).toUpperCase();
        
        if (bazikStatus === "SUCCESS" || bazikStatus === "COMPLETED" || bazikStatus === "SUCCESSFUL" || status === true) {
          const { upgradeMerchantPlan } = await import("@/lib/server/plans");
          try {
            await upgradeMerchantPlan(merchantId, planSlug);
            console.log(`Plan upgraded successfully via Bazik Webhook: Merchant ${merchantId} to ${planSlug}`);
          } catch (err) {
            console.error(`Erreur lors de l'upgrade de plan via Webhook:`, err);
          }
        }
      }
      return NextResponse.json({ received: true });
    }

    // Intercepter les retraits (Withdrawals)
    if (reference.startsWith('WTH-')) {
      const { data: withdrawal, error: fetchError } = await supabaseAdmin
        .from('withdrawals')
        .select('*')
        .eq('kobara_reference', reference)
        .single();

      if (fetchError || !withdrawal) {
        console.error(`Webhook error: Withdrawal not found for reference ${reference}`);
        return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
      }

      let newStatus = withdrawal.status;
      const bazikStatus = String(status).toUpperCase();

      if (bazikStatus === "SUCCESS" || bazikStatus === "COMPLETED" || bazikStatus === "SUCCESSFUL" || status === true) {
        newStatus = "completed";
      } else if (bazikStatus === "FAILED" || bazikStatus === "CANCELLED" || status === false) {
        newStatus = "failed";
      }

      if (newStatus !== withdrawal.status) {
        // Update withdrawal status
        const { error: updateError } = await supabaseAdmin
          .from('withdrawals')
          .update({
            status: newStatus,
            bazik_transaction_id: transaction_id || withdrawal.bazik_transaction_id,
            processed_at: newStatus === "completed" ? new Date().toISOString() : withdrawal.processed_at
          })
          .eq('id', withdrawal.id);

        if (updateError) throw updateError;

        // If withdrawal failed, refund the total amount to the merchant's balance
        if (newStatus === "failed") {
          const { data: merchant } = await supabaseAdmin
            .from('merchants')
            .select('available_balance, email')
            .eq('id', withdrawal.merchant_id)
            .single();

          if (merchant) {
            const currentBalance = Number(merchant.available_balance || 0);
            const totalRefund = Number(withdrawal.total || 0); // They paid the total amount

            await supabaseAdmin
              .from('merchants')
              .update({ available_balance: currentBalance + totalRefund })
              .eq('id', withdrawal.merchant_id);
              
            // Create notification and email for failed withdrawal refund
            if (merchant.email) {
              const { notifyWithdrawalFailed } = await import("@/lib/server/notifications");
              await notifyWithdrawalFailed(withdrawal.merchant_id, merchant.email, Number(withdrawal.amount));
            }
          }
        } else if (newStatus === "completed") {
          const { data: merchantData } = await supabaseAdmin.from('merchants').select('email').eq('id', withdrawal.merchant_id).single();
          if (merchantData?.email) {
            const { notifyWithdrawalSuccess } = await import("@/lib/server/notifications");
            await notifyWithdrawalSuccess(withdrawal.merchant_id, merchantData.email, Number(withdrawal.amount));
          }
        }
      }

      return NextResponse.json({ received: true });
    }

    // Find the payment
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('kobara_reference', reference)
      .single();

    if (fetchError || !payment) {
      console.error(`Webhook error: Payment not found for reference ${reference}`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Determine new status
    let newStatus = payment.status;
    let paidAt = payment.paid_at;

    const bazikStatus = String(status).toUpperCase();
    // SUCCESS, COMPLETED, SUCCESSFUL, or just true if boolean
    if (bazikStatus === "SUCCESS" || bazikStatus === "COMPLETED" || bazikStatus === "SUCCESSFUL" || status === true) {
      newStatus = "succeeded";
      paidAt = new Date().toISOString();
    } else if (bazikStatus === "FAILED" || bazikStatus === "CANCELLED" || status === false) {
      newStatus = "failed";
    }

    // Update payment
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: newStatus,
        bazik_transaction_id: transaction_id || payment.bazik_transaction_id,
        paid_at: paidAt
      })
      .eq('id', payment.id);

    if (updateError) {
      throw updateError;
    }

    // If payment succeeded, update the merchant's available balance and send notification
    if (newStatus === "succeeded" && payment.status !== "succeeded") {
      // 1. Update Merchant Balance
      const { data: merchant } = await supabaseAdmin
        .from('merchants')
        .select('available_balance, business_name')
        .eq('id', payment.merchant_id)
        .single();
      
      // Fetch Customer Name for notification
      let customerName = "un client";
      if (payment.customer_id) {
        const { data: customer } = await supabaseAdmin
          .from('customers')
          .select('name')
          .eq('id', payment.customer_id)
          .single();
        if (customer?.name) {
          customerName = customer.name;
        }
      }
      
      if (merchant) {
        const currentBalance = Number(merchant.available_balance || 0);
        const netAmount = Number(payment.net_amount || 0);
        
        const { error: balanceError } = await supabaseAdmin
          .from('merchants')
          .update({
            available_balance: currentBalance + netAmount
          })
          .eq('id', payment.merchant_id);
          
        if (balanceError) {
          console.error("Balance update error:", balanceError);
        }
      }

      // 2. Create Notification for Merchant via service
      const { data: merchantData } = await supabaseAdmin.from('merchants').select('email').eq('id', payment.merchant_id).single();
      if (merchantData?.email) {
        const { notifyPaymentSucceeded } = await import("@/lib/server/notifications");
        await notifyPaymentSucceeded(payment.merchant_id, merchantData.email, Number(payment.amount), payment.currency || 'HTG');
      }

      // 3. Send outbound webhooks to merchant endpoints
      const { data: endpoints } = await supabaseAdmin
        .from('webhook_endpoints')
        .select('*')
        .eq('merchant_id', payment.merchant_id)
        .eq('status', 'active');

      if (endpoints && endpoints.length > 0) {
        const eventPayload = {
          event_type: `payment.${newStatus}`,
          data: {
            id: payment.id,
            reference: payment.kobara_reference,
            amount: payment.amount,
            net_amount: payment.net_amount,
            currency: payment.currency,
            status: newStatus,
            paid_at: paidAt,
            metadata: payment.metadata
          }
        };

        for (const endpoint of endpoints) {
          try {
            const signature = crypto.createHmac('sha256', endpoint.secret)
              .update(JSON.stringify(eventPayload))
              .digest('hex');

            await fetch(endpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Kobara-Signature': signature,
                'Kobara-Event': eventPayload.event_type
              },
              body: JSON.stringify(eventPayload)
            });
          } catch (err) {
            console.error(`Failed to send webhook to ${endpoint.url}:`, err);
          }
        }
      }
    } else if (newStatus === "failed" && payment.status !== "failed") {
      const { data: merchantData } = await supabaseAdmin.from('merchants').select('email').eq('id', payment.merchant_id).single();
      if (merchantData?.email) {
        const { notifyPaymentFailed } = await import("@/lib/server/notifications");
        await notifyPaymentFailed(payment.merchant_id, merchantData.email, Number(payment.amount), payment.currency || 'HTG');
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
