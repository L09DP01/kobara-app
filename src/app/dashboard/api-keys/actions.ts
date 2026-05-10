'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function generateApiKey(name: string, environment: 'live' | 'test' = 'test') {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is owner
  let role = 'owner';
  let merchantId = null;

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchant) {
    merchantId = merchant.id;
  } else {
    // Check if user is a team member
    const { data: member } = await supabase
      .from('merchant_members')
      .select('merchant_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (member) {
      role = member.role;
      merchantId = member.merchant_id;
    }
  }

  if (!merchantId) {
    throw new Error("Merchant not found");
  }

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error("Failed to revoke API key");
  }

  revalidatePath('/dashboard/api-keys');
}
