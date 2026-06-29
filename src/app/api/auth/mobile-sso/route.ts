import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("access_token");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Jeton d'authentification manquant.")}`, req.url));
  }

  const MOBILE_TOKEN_SECRET = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_JWT_SECRET;
  
  if (!MOBILE_TOKEN_SECRET) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Erreur de configuration serveur.")}`, req.url));
  }

  const secret = new TextEncoder().encode(MOBILE_TOKEN_SECRET);

  try {
    // 1. Validate the mobile JWT
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.email) {
      throw new Error("No email in token payload");
    }

    const email = payload.email as string;

    // 2. Generate Supabase magic link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (error || !data?.properties?.action_link) {
      console.error("Error generating magic link:", error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Impossible de générer le lien de connexion.")}`, req.url));
    }

    // 3. Redirect the user to the Supabase verification URL
    // We add the custom redirect_to so Supabase redirects back to our requested page
    const actionLink = new URL(data.properties.action_link);
    
    // Supabase action_link usually has a redirect_to param. We replace it.
    actionLink.searchParams.set("redirect_to", new URL(next, req.url).toString());

    return NextResponse.redirect(actionLink.toString());
  } catch (error) {
    console.error("SSO Verification error:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Jeton d'authentification invalide ou expiré.")}`, req.url));
  }
}
