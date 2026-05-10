import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ApiKeySecurity } from "@/lib/server/security/api-keys";

export async function authenticateApiRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer kbr_sk_")) {
    const apiKey = authHeader.replace("Bearer ", "");
    const keyHash = ApiKeySecurity.hashKey(apiKey);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (supabaseServiceKey) {
      const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceKey, {
        cookies: {
          getAll() { return [] },
          setAll() { }
        }
      });
      
      const { data: keyRecord, error: keyError } = await supabaseAdmin
        .from('api_keys')
        .select('merchant_id, environment, revoked_at')
        .eq('key_hash', keyHash)
        .single();

      if (keyError || !keyRecord) {
        return { merchantId: null, error: "Invalid API Key" };
      }

      if (keyRecord.revoked_at) {
        return { merchantId: null, error: "API Key has been revoked" };
      }

      // Update last used timestamp (non-blocking)
      supabaseAdmin
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('key_hash', keyHash)
        .then(({ error }) => {
          if (error) console.error("Failed to update API key last_used_at:", error);
        });

      return { 
        merchantId: keyRecord.merchant_id, 
        environment: keyRecord.environment, 
        error: null 
      };
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
