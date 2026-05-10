'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function completeOnboarding(formData: {
  first_name: string;
  last_name: string;
  business_name: string;
  category: string;
  phone: string;
  address?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Vous devez être connecté pour finaliser votre inscription.");
  }

  // 1. Update User metadata with first_name and last_name
  await supabase.auth.updateUser({
    data: { 
      first_name: formData.first_name, 
      last_name: formData.last_name 
    }
  });

  // 2. Generate a unique business slug
  const baseSlug = formData.business_name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, '');       // remove leading/trailing dashes
  
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const businessSlug = `${baseSlug}-${randomSuffix}`;

  // 3. Create the merchant profile
  const { error } = await supabase
    .from('merchants')
    .insert({
      user_id: user.id,
      email: user.email,
      business_name: formData.business_name,
      business_slug: businessSlug,
      category: formData.category,
      phone: formData.phone,
      address: formData.address || null,
      status: 'active', // default status for MVP
      available_balance: 0,
      pending_balance: 0
    });

  if (error) {
    console.error("Erreur onboarding:", error);
    throw new Error("Erreur lors de la création du profil marchand. " + error.message);
  }

  // 4. Generate default API keys for the new merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchant) {
    const { ApiKeySecurity } = require("@/lib/server/security/api-keys");
    // Generate Test Key
    const { rawKey: testKeyRaw, keyHash: testKeyHash } = ApiKeySecurity.generateKey("kbr_sk_test_");
    
    // Generate Live Key
    const { rawKey: liveKeyRaw, keyHash: liveKeyHash } = ApiKeySecurity.generateKey("kbr_sk_live_");

    await supabase.from('api_keys').insert([
      { 
        merchant_id: merchant.id, 
        name: 'Clé Test par défaut', 
        prefix: 'kbr_sk_test_', 
        key_hash: testKeyHash, 
        environment: 'test' 
      },
      { 
        merchant_id: merchant.id, 
        name: 'Clé Live par défaut', 
        prefix: 'kbr_sk_live_', 
        key_hash: liveKeyHash, 
        environment: 'live' 
      }
    ]);
  }

  return { success: true };
}
