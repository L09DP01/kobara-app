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
    const { reference, status, amount, transaction_id } = body;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // We must use the service role key to bypass RLS, because the webhook comes from Bazik,
    // not from an authenticated merchant user session.
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
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Determine new status
    // Map Bazik statuses to Kobara statuses. Assuming Bazik sends "SUCCESS", "FAILED", etc.
    let newStatus = payment.status;
    let paidAt = payment.paid_at;

    const bazikStatus = String(status).toUpperCase();
    if (bazikStatus === "SUCCESS" || bazikStatus === "COMPLETED" || bazikStatus === "SUCCESSFUL") {
      newStatus = "succeeded";
      paidAt = new Date().toISOString();
    } else if (bazikStatus === "FAILED" || bazikStatus === "CANCELLED") {
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

    // If payment succeeded, update the merchant's available balance
    if (newStatus === "succeeded" && payment.status !== "succeeded") {
      // Need to fetch current balance and add net_amount
      const { data: merchant } = await supabaseAdmin
        .from('merchants')
        .select('available_balance')
        .eq('id', payment.merchant_id)
        .single();
      
      if (merchant) {
        await supabaseAdmin
          .from('merchants')
          .update({
            available_balance: Number(merchant.available_balance) + Number(payment.net_amount)
          })
          .eq('id', payment.merchant_id);
      }

      // 4. Send outbound webhooks to merchant endpoints
      const { data: endpoints } = await supabaseAdmin
        .from('webhook_endpoints')
        .select('*')
        .eq('merchant_id', payment.merchant_id)
        .eq('status', 'active');

      if (endpoints && endpoints.length > 0) {
        // Create the event payload
        const eventPayload = {
          event: `payment.${newStatus}`, // e.g., payment.succeeded
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

        // Note: For MVP we send synchronously. In prod, use a queue or Edge Functions background tasks.
        for (const endpoint of endpoints) {
          try {
            // Compute HMAC signature
            const crypto = require('crypto');
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

            // Log event success (Optional MVP step)
          } catch (err) {
            console.error(`Failed to send webhook to ${endpoint.url}:`, err);
            // Log event failure for retries (Optional MVP step)
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
