import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
// Need service role client to bypass RLS for API key verification if needed, 
// but normal client might work if we have no RLS blocking reading api keys by hash.
// For now, let's just use the server client.
import { createServerClient } from "@supabase/ssr";

export async function authenticateApiRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer kobara_sk_")) {
    const apiKey = authHeader.replace("Bearer ", "");
    // TODO: implement API Key hash verification.
    // In a real scenario, you hash the key, check the DB `api_keys` table.
    
    // For MVP, we will instantiate a service role client to fetch the merchant
    // associated with this key.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (supabaseServiceKey) {
      const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceKey, {
        cookies: {
          getAll() { return [] },
          setAll() { }
        }
      });
      // In production, we'd do: .eq('key_hash', hash(apiKey))
      // For this step, we just mock the validation to avoid hashing complexity right now.
      // But we need the merchant. 
      return { merchantId: null, error: "API Keys not fully implemented in MVP yet." };
    }
  }

  // Fallback to session cookie (for internal dashboard use)
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (merchant) {
      return { merchantId: merchant.id, error: null };
    }
  }

  return { merchantId: null, error: "Unauthorized" };
}
