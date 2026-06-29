import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { payload, errorResponse } = await verifyMobileToken(req);
    if (errorResponse) return errorResponse;
    if (!payload || !payload.sub) return NextResponse.json({ error: "Token invalide." }, { status: 401 });

    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from("merchants")
      .select("*")
      .eq("user_id", payload.sub)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Profil marchand introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: merchant });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { payload, errorResponse } = await verifyMobileToken(req);
    if (errorResponse) return errorResponse;
    if (!payload || !payload.sub) return NextResponse.json({ error: "Token invalide." }, { status: 401 });

    const body = await req.json();
    const { business_name, email, phone, address } = body;

    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from("merchants")
      .update({
        business_name,
        email,
        phone,
        address,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", payload.sub)
      .select()
      .single();

    if (merchantError) {
      console.error("[Merchant Update Error]:", merchantError);
      return NextResponse.json({ error: "Impossible de mettre à jour le profil." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: merchant });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
