import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { canCreateWithdrawal } from "@/lib/server/access";
import { BazikService } from "@/lib/server/bazik/bazik.service";

export async function POST(req: NextRequest) {
  try {
    const { payload, errorResponse } = await verifyMobileToken(req);
    if (errorResponse) return errorResponse;
    if (!payload || !payload.sub) return NextResponse.json({ error: "Token invalide." }, { status: 401 });

    const userId = payload.sub;
    const body = await req.json();
    const { method, amount, reference } = body;

    if (!method || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !reference) {
      return NextResponse.json({ error: "Données de retrait invalides." }, { status: 400 });
    }

    if (method.toLowerCase() === 'zelle' && Number(amount) < 3000) {
      return NextResponse.json({ error: "Le montant minimum pour Zelle est de 3000 HTG (20 $)." }, { status: 400 });
    } else if (method.toLowerCase() !== 'zelle' && Number(amount) < 150) {
      return NextResponse.json({ error: "Le montant minimum est de 150 HTG." }, { status: 400 });
    }

    // 1. Get merchant ID, balance, and environment
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .select('id, available_balance, available_balance_test, current_environment')
      .eq('user_id', userId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Marchand introuvable" }, { status: 404 });
    }

    const isTest = merchant.current_environment === 'test';
    const activeBalance = isTest ? Number(merchant.available_balance_test || 0) : Number(merchant.available_balance || 0);

    // Check withdrawal limits based on plan
    const accessCheck = await canCreateWithdrawal(merchant.id, Number(amount));
    if (!accessCheck.allowed) {
      const reason = accessCheck.reason === 'kyc_required' 
        ? "Votre compte doit être vérifié (KYC) pour effectuer des retraits."
        : "Vous avez atteint la limite de retrait de votre forfait actuel.";
      return NextResponse.json({ error: reason }, { status: 403 });
    }

    if (activeBalance < Number(amount)) {
      return NextResponse.json({ error: "Fonds insuffisants pour ce retrait." }, { status: 400 });
    }

    const fees = method.toLowerCase() === 'zelle' ? 0 : Number(amount) * 0.05;
    const netAmount = Number(amount) - fees;
    const kobaraRef = `WTH-${Date.now()}`;
    let bazikResponse: any = null;

    // 2. Call MonCash API (Bazik) BEFORE deducting money if it's MonCash
    if (method.toLowerCase() === 'moncash') {
      if (isTest) {
        bazikResponse = { transaction_id: `TEST-WTH-${Date.now()}` };
      } else {
        try {
          bazikResponse = await BazikService.createWithdrawal({
            amount: netAmount,
            receiver: reference,
            reference: kobaraRef,
            description: "Retrait Kobara (Mobile)",
          });
        } catch (apiError: any) {
          console.error("Bazik withdrawal error on mobile:", apiError);
          return NextResponse.json({ error: `Échec du transfert MonCash: ${apiError.message || "Erreur interne"}` }, { status: 500 });
        }
      }
    }

    // 3. Deduct amount from correct balance
    const newBalance = activeBalance - Number(amount);
    const updateData = isTest 
      ? { available_balance_test: newBalance }
      : { available_balance: newBalance };

    const { error: updateError } = await supabaseAdmin
      .from('merchants')
      .update(updateData)
      .eq('id', merchant.id);

    if (updateError) {
      console.error("Failed to deduct balance:", updateError);
      return NextResponse.json({ error: "Erreur lors de la déduction du solde." }, { status: 500 });
    }

    // 4. Create pending withdrawal record
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        merchant_id: merchant.id,
        environment: merchant.current_environment || 'test',
        kobara_reference: kobaraRef,
        bazik_transaction_id: bazikResponse?.transaction_id || bazikResponse?.id || null,
        amount: netAmount,
        fees: fees,
        total: Number(amount),
        wallet: reference,
        provider: method.toLowerCase(),
        status: method.toLowerCase() === 'moncash' ? 'processing' : 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create withdrawal record:", insertError);
      // Rollback
      await supabaseAdmin
        .from('merchants')
        .update({
           [isTest ? 'available_balance_test' : 'available_balance']: activeBalance
        })
        .eq('id', merchant.id);
        
      return NextResponse.json({ error: "Erreur lors de la création du retrait." }, { status: 500 });
    }

    // Success
    return NextResponse.json({ 
      success: true, 
      withdrawal 
    });
    
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
