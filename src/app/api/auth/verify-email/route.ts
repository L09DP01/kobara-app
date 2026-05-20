import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Jeton de validation manquant.", request.url));
  }

  const supabase = createAdminClient();

  // Search user with this active token
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.redirect(new URL("/login?error=Jeton de validation invalide ou déjà utilisé.", request.url));
  }

  // Check if token has expired
  const expiresAt = new Date(user.verification_token_expires).getTime();
  if (Date.now() > expiresAt) {
    return NextResponse.redirect(new URL("/login?error=Le lien de validation a expiré. Veuillez recréer votre compte.", request.url));
  }

  // Verify user e-mail and clear tokens
  const { error: updateError } = await supabase
    .from("users")
    .update({
      email_verified: true,
      verification_token: null,
      verification_token_expires: null
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.redirect(new URL("/login?error=Impossible de valider votre compte. Veuillez réessayer.", request.url));
  }

  // Successfully verified! Redirect to login with success message
  return NextResponse.redirect(
    new URL(
      "/login?success=Votre adresse e-mail a été validée avec succès ! Vous pouvez maintenant vous connecter.",
      request.url
    )
  );
}
