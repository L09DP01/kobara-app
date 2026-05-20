import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createAdminClient } from "./admin";
import { createClient } from "./server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUserAndMerchant() {
  const session = await getServerSession(authOptions) as any;
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const supabaseAdmin = createAdminClient();
  const { data: merchant } = await supabaseAdmin
    .from("merchants")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant || !merchant.phone || !merchant.category) {
    redirect("/onboarding");
  }

  // Create an RLS-enabled client for the current user
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore, session?.supabaseAccessToken);

  return { user, merchant, supabase };
}
