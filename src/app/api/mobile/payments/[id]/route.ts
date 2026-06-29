import { NextResponse } from "next/server";
import { getSupabaseRouteHandler } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteHandler();
    
    // 1. Get current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Get merchant profile
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Marchand introuvable" }, { status: 404 });
    }

    // 3. Get payment details with customer and payment link info
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        payment_links (
          id,
          title,
          description
        )
      `)
      .eq('merchant_id', merchant.id)
      .eq('id', params.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error("Payment details error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
