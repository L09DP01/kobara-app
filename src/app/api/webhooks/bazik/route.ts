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
    
    if (secret && signature) {
      const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
       // In production we absolutely require the signature and secret
       return NextResponse.json({ error: "Missing signature or secret" }, { status: 401 });
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

      // 2. Create Notification for Merchant
      await supabaseAdmin.from('notifications').insert({
        merchant_id: payment.merchant_id,
        type: 'payment_received',
        title: '💰 Nouveau paiement reçu',
        message: `Vous avez reçu un paiement de ${payment.amount} HTG de la part de ${customerName}. Référence: ${payment.kobara_reference}`
      });

      // 3. Send outbound webhooks to merchant endpoints
      const { data: endpoints } = await supabaseAdmin
        .from('webhook_endpoints')
        .select('*')
        .eq('merchant_id', payment.merchant_id)
        .eq('status', 'active');

      if (endpoints && endpoints.length > 0) {
        const eventPayload = {
          event: `payment.${newStatus}`,
          data: {
            id: payment.id,
            reference: payment.kobara_reference,
            amount: payment.amount,
            net_amount: payment.net_amount,
            currency: payment.currency,
            status: newStatus,
            paid_at: paidAt
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
                'Kobara-Event': eventPayload.event
              },
              body: JSON.stringify(eventPayload)
            });
          } catch (err) {
            console.error(`Failed to send webhook to ${endpoint.url}:`, err);
          }
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
