import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { payload, errorResponse } = await verifyMobileToken(req);
    if (errorResponse) return errorResponse;
    if (!payload || !payload.sub) return NextResponse.json({ error: "Token invalide." }, { status: 401 });

    const userId = payload.sub;

    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from("merchants")
      .select("id, current_environment")
      .eq("user_id", userId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Profil marchand introuvable.", code: "MERCHANT_NOT_FOUND" }, { status: 404 });
    }

    const environment = merchant.current_environment || 'test';
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('subscriptions')
      .select('id, amount, currency, status, billing_interval, next_billing_date, created_at, customers(name, email), plans(name)', { count: 'exact' })
      .eq('merchant_id', merchant.id)
      .eq('environment', environment)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      // Pour les abonnements, on pourrait chercher par nom de client.
      // Supabase ne supporte pas ilike sur une table jointe dans la requête simple, 
      // donc on devrait l'implémenter autrement si c'est vraiment nécessaire.
      // Pour ce prototype, on ignore la recherche si elle demande une jointure complexe sans vue.
    }

    const { data: subscriptions, count, error: subscriptionsError } = await query;

    if (subscriptionsError) {
      // If table 'subscriptions' doesn't exist yet, just return empty gracefully
      if (subscriptionsError.code === '42P01') {
        return NextResponse.json({ success: true, subscriptions: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
      console.error("Error fetching mobile subscriptions:", subscriptionsError);
      return NextResponse.json({ error: "Erreur lors de la récupération des abonnements." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error: any) {
    console.error("API /mobile/subscriptions error:", error);
    return NextResponse.json({ error: "Erreur serveur interne." }, { status: 500 });
  }
}
