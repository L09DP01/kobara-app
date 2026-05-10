import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/server/auth/api-auth";
import { BazikService } from "@/lib/server/bazik/bazik.service";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const PaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("HTG"),
  description: z.string().optional(),
  customer: z.any().optional(), // Could be more strictly typed
  successUrl: z.string().url().optional(),
  errorUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { merchantId, error: authError } = await authenticateApiRequest(request);

    if (authError || !merchantId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validationResult = PaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Validation Error", details: validationResult.error.issues }, { status: 400 });
    }

    const { amount, currency, description, successUrl, errorUrl, metadata } = validationResult.data;

    // Connect to Supabase
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Generate a unique Kobara Reference
    const kobaraReference = `KOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. Call Bazik to create the payment
    const bazikResponse = await BazikService.createMoncashPayment({
      amount: amount,
      reference: kobaraReference,
      description: description || "Paiement Kobara API",
    });

    // Bazik response typically gives a payment URL or an order ID.
    const bazikOrderId = bazikResponse.order_id || bazikResponse.id || null;

    // 3. Save pending payment to DB
    const feeAmount = amount * 0.029; // 2.9% fee
    const netAmount = amount - feeAmount;

    const { data: payment, error: dbError } = await supabase.from('payments').insert({
      merchant_id: merchantId,
      kobara_reference: kobaraReference,
      bazik_order_id: bazikOrderId,
      amount: amount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      currency: currency,
      status: 'pending',
      success_url: successUrl,
      error_url: errorUrl,
      metadata: metadata,
    }).select().single();

    if (dbError) {
      console.error("Payment insertion error:", dbError);
      return NextResponse.json({ error: "Internal Database Error" }, { status: 500 });
    }

    // 4. Return response to merchant
    return NextResponse.json({
      id: payment.id,
      reference: payment.kobara_reference,
      amount: payment.amount,
      status: payment.status,
      payment_url: bazikResponse.payment_url || bazikResponse.url || null, // URL for customer to pay
    });

  } catch (error: any) {
    console.error("API Payment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { merchantId, error: authError } = await authenticateApiRequest(request);

    if (authError || !merchantId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get search params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("API GET Payments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
