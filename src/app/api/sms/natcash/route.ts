import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseNatcashSMS } from "@/lib/server/sms/natcash-parser";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the Webhook
    const authHeader = request.headers.get('Authorization');
    const expectedSecret = process.env.SMS_GATEWAY_SECRET || 'natcash-kobara-secret-2026';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { raw_message, sender } = body;
    if (!raw_message) {
      return NextResponse.json({ error: "Missing raw_message" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // 2. Parse the SMS
    const parsed = await parseNatcashSMS(raw_message);
    
    if (!parsed) {
      // Save as ignored/failed parsing
      await supabase.from('sms_inbox').insert({
        raw_message,
        source: 'natcash',
        status: 'failed',
        error_reason: 'Failed to parse NatCash format'
      });
      return NextResponse.json({ success: false, reason: "Parse failed" }, { status: 200 });
    }

    // Check if TransCode already exists (prevent double processing)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('trans_code', parsed.transCode)
      .maybeSingle();

    if (existingPayment) {
      // Already processed
      await supabase.from('sms_inbox').insert({
        raw_message,
        parsed_json: parsed,
        source: 'natcash',
        status: 'ignored',
        error_reason: 'TransCode already used',
        payment_id: existingPayment.id
      });
      return NextResponse.json({ success: true, ignored: true, reason: "Already processed" }, { status: 200 });
    }

    // 3. Find matching payment
    let matchedPayment = null;
    let errorReason = null;
    let status = 'pending';

    // Format validation: must be 8 alphanumeric characters (e.g. TVP8K3B2)
    const isValidFormat = parsed.referenceCode && /^[A-Z0-9]{8}$/i.test(parsed.referenceCode);

    if (!parsed.referenceCode || !isValidFormat) {
      errorReason = parsed.referenceCode ? 'Format de code invalide' : 'Aucun code extrait';
      status = 'ignored'; // Auto ignore
    } else {
      // Search for pending payment with this reference code
      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('id, amount, status, expires_at')
        .eq('reference_code', parsed.referenceCode.toUpperCase())
        .eq('status', 'pending');

      if (pendingPayments && pendingPayments.length > 0) {
        const p = pendingPayments[0]; // Take the first match
        
        if (p.amount !== parsed.amount) {
          // Amount mismatch, but reference matches
          errorReason = `Montant incorrect: Attendu ${p.amount}, Reçu ${parsed.amount}`;
          status = 'failed';
        } else {
          // Check expiration
          const now = new Date();
          const expiresAt = new Date(p.expires_at);
          if (now > expiresAt) {
            errorReason = 'Paiement expiré avant réception du SMS';
            status = 'failed';
            await supabase.from('payments').update({ status: 'expired' }).eq('id', p.id);
          } else {
            // MATCH!
            matchedPayment = p;
            status = 'processed';
          }
        }
        
        // Save SMS matched
        await supabase.from('sms_inbox').insert({
          raw_message,
          parsed_json: parsed,
          source: 'natcash',
          status: status,
          error_reason: errorReason,
          payment_id: p.id
        });

        // If matched successfully, update payment
        if (matchedPayment) {
          await supabase.from('payments').update({
            status: 'succeeded',
            paid_at: new Date().toISOString(),
            trans_code: parsed.transCode
          }).eq('id', matchedPayment.id);
          
          return NextResponse.json({ success: true, processed: true, payment_id: matchedPayment.id }, { status: 200 });
        } else {
          return NextResponse.json({ success: true, processed: false, reason: errorReason }, { status: 200 });
        }
      } else {
        // No pending payment found for this code
        // Auto ignore
        errorReason = `Aucun paiement en attente pour le code ${parsed.referenceCode}`;
        status = 'ignored';
      }
    }

    // Save ignored/failed SMS that didn't match any payment
    await supabase.from('sms_inbox').insert({
      raw_message,
      parsed_json: parsed,
      source: 'natcash',
      status: status,
      error_reason: errorReason
    });

    return NextResponse.json({ success: true, processed: false, reason: errorReason }, { status: 200 });

  } catch (error) {
    console.error("NatCash Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
