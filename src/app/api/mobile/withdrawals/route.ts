import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { canCreateWithdrawal } from "@/lib/server/access";

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

    // 1. Get merchant ID and balance
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .select('id, available_balance')
      .eq('user_id', userId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Marchand introuvable" }, { status: 404 });
    }

    // Check withdrawal limits based on plan
    const accessCheck = await canCreateWithdrawal(merchant.id, Number(amount));
    if (!accessCheck.allowed) {
      const reason = accessCheck.reason === 'kyc_required' 
        ? "Votre compte doit être vérifié (KYC) pour effectuer des retraits."
        : "Vous avez atteint la limite de retrait de votre forfait actuel.";
      return NextResponse.json({ error: reason }, { status: 403 });
    }

    if (Number(merchant.available_balance) < Number(amount)) {
      return NextResponse.json({ error: "Fonds insuffisants pour ce retrait." }, { status: 400 });
    }

    // 2. Deduct amount from balance
    const { error: updateError } = await supabaseAdmin
      .from('merchants')
      .update({ available_balance: Number(merchant.available_balance) - Number(amount) })
      .eq('id', merchant.id);

    if (updateError) {
      console.error("Failed to deduct balance:", updateError);
      return NextResponse.json({ error: "Erreur lors de la déduction du solde." }, { status: 500 });
    }

    const fees = method === 'zelle' ? 0 : Number(amount) * 0.05;

    // 3. Create pending withdrawal record
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        merchant_id: merchant.id,
        amount: Number(amount) - fees, // Net amount they receive
        fees: fees,
        total: Number(amount), // Gross amount deducted
        wallet: reference, // we put reference in wallet as per schema
        provider: method,
        status: 'pending',
        kobara_reference: `WD-${Date.now()}`
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create withdrawal record:", insertError);
      // Rollback is manual here since we don't have RPC for withdrawals yet, 
      // but typically we'd use a transaction.
      await supabaseAdmin
        .from('merchants')
        .update({ available_balance: merchant.available_balance })
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
