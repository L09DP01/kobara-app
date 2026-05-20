'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { revalidatePath } from "next/cache";

export async function generateApiKey(name: string, environment: 'live' | 'test' = 'test') {
  const { user, merchant, supabase } = await getCurrentUserAndMerchant();

  // For API keys, the user should be owner/admin. Let's assume standard role for now as per MVP.
  let role = 'owner';
  let merchantId = merchant.id;

  // Apply permission logic
  if (environment === 'live' && role !== 'owner' && role !== 'admin') {
    throw new Error("Only owners and admins can generate live API keys");
  }

  // Generate a random key
  const { ApiKeySecurity } = require("@/lib/server/security/api-keys");
  const prefix = environment === 'live' ? "kbr_sk_live_" : "kbr_sk_test_";
  const { rawKey, keyHash } = ApiKeySecurity.generateKey(prefix);

  const { error } = await supabase
    .from('api_keys')
    .insert({
      merchant_id: merchantId,
      name: name,
      prefix: prefix,
      key_hash: keyHash,
      environment: environment
    });

  if (error) {
    console.error("API Key Insert Error:", error);
    throw new Error("Failed to create API key");
  }

  revalidatePath('/dashboard/api-keys');

  return { rawKey, name, environment };
}

export async function revokeApiKey(id: string) {
  const { user, merchant, supabase } = await getCurrentUserAndMerchant();

  // With RLS enabled, we only need to ensure the key belongs to the current merchant
  const { data: keyInfo } = await supabase
    .from('api_keys')
    .select('merchant_id')
    .eq('id', id)
    .single();

  if (!keyInfo) {
    throw new Error("API key not found");
  }

  if (keyInfo.merchant_id !== merchant.id) {
    throw new Error("Vous n'êtes pas autorisé à révoquer cette clé API");
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error("Failed to revoke API key");
  }

  revalidatePath('/dashboard/api-keys');
}

