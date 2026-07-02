import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paymentId = resolvedParams.id;
    
    const body = await request.json();
    const { transCode } = body;

    if (!transCode) {
      return NextResponse.json({ error: "TransCode manquant" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch the payment details
    const { data: payment, error: pError } = await supabaseAdmin
      .from('payments')
      .select('id, amount, status')
      .eq('id', paymentId)
      .single();

    if (pError || !payment) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    if (payment.status === 'succeeded') {
      return NextResponse.json({ success: true, message: "Déjà payé" }, { status: 200 });
    }

    // 2. Search for the SMS in the inbox using the exact transCode
    const { data: smsList, error: smsError } = await supabaseAdmin
      .from('sms_inbox')
      .select('id, raw_message, parsed_json, status, payment_id')
      .eq('source', 'natcash')
      .filter('parsed_json->>transCode', 'eq', transCode);

    if (smsError) {
      console.error("Erreur recherche SMS:", smsError);
      return NextResponse.json({ error: "Erreur serveur lors de la vérification" }, { status: 500 });
    }

    if (!smsList || smsList.length === 0) {
      return NextResponse.json({ error: "Ce code de transaction (TransCode) est introuvable." }, { status: 404 });
    }

    // Check if SMS was already linked to another successful payment
    const sms = smsList[0];
    if (sms.status === 'processed' && sms.payment_id !== payment.id) {
      return NextResponse.json({ error: "Ce paiement a déjà été utilisé pour une autre transaction." }, { status: 400 });
    }

    const parsed = sms.parsed_json as any;

    // 3. Verify that the amount matches with a small tolerance (1 HTG)
    if (!parsed || !parsed.amount) {
      return NextResponse.json({ error: "Données du SMS invalides" }, { status: 500 });
    }

    const amountDiff = Math.abs(payment.amount - parsed.amount);
    if (amountDiff > 1) {
      return NextResponse.json({ 
        error: `Montant incorrect. Le transfert était de ${parsed.amount} HTG.` 
      }, { status: 400 });
    }

    // 4. Update the payment as succeeded
    await supabaseAdmin.from('payments').update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      trans_code: transCode
    }).eq('id', payment.id);

    // 5. Update the SMS inbox
    await supabaseAdmin.from('sms_inbox').update({
      status: 'processed',
      error_reason: 'Récupéré manuellement via TransCode client',
      payment_id: payment.id
    }).eq('id', sms.id);

    // 6. Centralized post-success handler (balance, webhooks, notifications, plan upgrade)
    const { onPaymentSucceeded } = await import('@/lib/server/payments/on-payment-succeeded');
    await onPaymentSucceeded(payment.id);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Erreur claim-transcode:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
