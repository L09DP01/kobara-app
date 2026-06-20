import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, status } = body;

    if (!reference || !status) {
      return NextResponse.json({ error: "Missing reference or status" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Fetch the payment
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("kobara_reference", reference)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.environment !== "test") {
      return NextResponse.json({ error: "Only test payments can be simulated" }, { status: 400 });
    }

    if (payment.status !== "pending") {
      return NextResponse.json({ error: "Payment is already processed" }, { status: 400 });
    }

    // Update payment
    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update({ status: status })
      .eq("id", payment.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }

    // Prepare webhook payload (similar to bazik webhook logic)
    const eventPayload = {
      event: `payment.${status}`, // payment.succeeded or payment.failed
      data: {
        id: payment.id,
        reference: payment.kobara_reference,
        amount: payment.amount,
        net_amount: payment.net_amount || payment.amount,
        currency: payment.currency || 'HTG',
        status: status,
        reason: status === 'succeeded' ? 'simulation_success' : 'simulation_failed'
      }
    };

    // Fire webhook
    const { data: endpoints } = await supabaseAdmin
      .from('webhook_endpoints')
      .select('*')
      .eq('merchant_id', payment.merchant_id)
      .eq('status', 'active');

    if (endpoints && endpoints.length > 0) {
      const crypto = await import('crypto');
      for (const endpoint of endpoints) {
        try {
          const signature = crypto.createHmac('sha256', endpoint.secret)
            .update(JSON.stringify(eventPayload))
            .digest('hex');

          fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Kobara-Signature': signature,
              'Kobara-Event': eventPayload.event
            },
            body: JSON.stringify(eventPayload)
          }).catch(err => console.error(`Failed to post webhook to ${endpoint.url}:`, err));
        } catch (err) {
          console.error(`Failed to prepare webhook for ${endpoint.url}:`, err);
        }
      }
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      merchant_id: payment.merchant_id,
      type: status === 'succeeded' ? 'payment_received' : 'payment_failed',
      title: status === 'succeeded' ? '💰 Paiement Test Réussi' : '❌ Paiement Test Échoué',
      message: `Simulation du paiement de ${payment.amount} HTG (Réf: ${payment.kobara_reference})`
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Simulation error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
