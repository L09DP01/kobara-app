import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/server/auth/api-auth";
import { BazikService } from "@/lib/server/bazik/bazik.service";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { z } from "zod";
import { apiLimiter } from "@/lib/server/security/rate-limit";

import { PaymentCreatePayloadSchema } from "@/lib/server/validators";

import { canCreatePayment } from "@/lib/server/access";

export async function POST(request: NextRequest) {
  try {
    const { merchantId, environment, error: authError } = await authenticateApiRequest(request);

    if (authError || !merchantId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const accessCheck = await canCreatePayment(merchantId, environment as 'test' | 'live');
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: "Access Denied", reason: accessCheck.reason }, { status: 403 });
    }

    const { success } = await apiLimiter.limit(`api_payments_${merchantId}`);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validationResult = PaymentCreatePayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Validation Error", details: validationResult.error.issues }, { status: 400 });
    }

    const { amount, currency, description, success_url, cancel_url, metadata, customer } = validationResult.data;

    // Connect to Supabase
    const supabase = createAdminClient();

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

    // 2.5 Resolve Customer
    let customerId = null;
    if (customer) {
      const { name, email, phone } = customer;
      
      let existingCustomer = null;
      if (email) {
        const { data } = await supabase
          .from('customers')
          .select('id')
          .eq('merchant_id', merchantId)
          .eq('email', email)
          .maybeSingle();
        if (data) existingCustomer = data;
      }
      
      if (!existingCustomer && phone) {
        const { data } = await supabase
          .from('customers')
          .select('id')
          .eq('merchant_id', merchantId)
          .eq('phone', phone)
          .maybeSingle();
        if (data) existingCustomer = data;
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Mettre à jour si de nouvelles infos sont fournies
        const updates: any = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        
        if (Object.keys(updates).length > 0) {
          await supabase.from('customers').update(updates).eq('id', customerId);
        }
      } else {
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            merchant_id: merchantId,
            environment: environment,
            name: name || 'Client inconnu',
            email: email || null,
            phone: phone || null,
            wallet: phone || null
          })
          .select('id')
          .single();
          
        if (newCustomer) {
          customerId = newCustomer.id;
        } else {
          console.error("Erreur création client API", createError);
        }
      }
    }

    // 3. Save pending payment to DB
    const { getMerchantCurrentPlan } = await import('@/lib/server/plans');
    const { plan } = await getMerchantCurrentPlan(merchantId);
    const feePercent = plan ? (plan.transaction_fee_percent / 100) : 0.04;
    
    const feeAmount = parseFloat((amount * feePercent).toFixed(2));
    const netAmount = parseFloat((amount - feeAmount).toFixed(2));

    const { data: payment, error: dbError } = await supabase.from('payments').insert({
      merchant_id: merchantId,
      environment: environment,
      customer_id: customerId,
      kobara_reference: kobaraReference,
      bazik_order_id: bazikOrderId,
      amount: amount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      currency: currency,
      status: 'pending',
      success_url: success_url,
      error_url: cancel_url,
      metadata: metadata,
    }).select().single();

    if (dbError) {
      console.error("Payment insertion error:", dbError);
      return NextResponse.json({ error: "Internal Database Error" }, { status: 500 });
    }

    // Call notification service
    const { notifyPaymentCreated } = await import('@/lib/server/notifications');
    try {
      const { data: mData } = await supabase.from('merchants').select('email').eq('id', merchantId).single();
      if (mData) {
        await notifyPaymentCreated(merchantId, mData.email, amount, currency);
      }
    } catch(e) { console.error("Notification failed", e); }

    // 4. Return response to merchant
    return NextResponse.json({
      status: "success",
      data: {
        id: payment.id,
        reference: payment.kobara_reference,
        amount: payment.amount,
        status: payment.status,
        checkout_url: bazikResponse.payment_url || bazikResponse.url || null, // URL for customer to pay
      }
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

    const { success } = await apiLimiter.limit(`api_payments_get_${merchantId}`);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const supabase = createAdminClient();

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
