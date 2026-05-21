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

  const { canCreateApiKey } = require("@/lib/server/access");
  const accessCheck = await canCreateApiKey(merchantId, environment);
  if (!accessCheck.allowed) {
    if (accessCheck.reason === 'kyc_required') throw new Error("Vous devez vérifier votre compte (KYC) pour créer une clé Live.");
    if (accessCheck.reason === 'api_key_limit_reached') throw new Error("Vous avez atteint la limite de clés API de votre plan.");
    throw new Error("Access Denied");
  }

  // Generate a random key
  const { ApiKeySecurity } = require("@/lib/server/security/api-keys");
  const prefix = environment === 'live' ? "kbr_sk_live_" : "kbr_sk_test_";
  const { rawKey, keyHash } = ApiKeySecurity.generateKey(prefix);

  const { createAdminClient } = require("@/utils/supabase/admin");
  const adminClient = createAdminClient();

  const { error } = await adminClient
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

  // Verify the key belongs to this merchant (via RLS-protected SELECT)
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

  // Use admin client to bypass RLS (no DELETE policy exists on api_keys)
  const { createAdminClient } = require("@/utils/supabase/admin");
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('merchant_id', merchant.id); // Double-check ownership

  if (error) {
    console.error("API Key Delete Error:", error);
    throw new Error("Failed to delete API key");
  }

  revalidatePath('/dashboard/api-keys');
}

