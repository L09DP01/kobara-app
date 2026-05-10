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
    const crypto = require('crypto');
    // Generate Test Key
    const testKeyRaw = "kobara_sk_test_" + crypto.randomBytes(24).toString('hex');
    const testKeyHash = crypto.createHash('sha256').update(testKeyRaw).digest('hex');
    
    // Generate Live Key
    const liveKeyRaw = "kobara_sk_live_" + crypto.randomBytes(24).toString('hex');
    const liveKeyHash = crypto.createHash('sha256').update(liveKeyRaw).digest('hex');

    await supabase.from('api_keys').insert([
      { merchant_id: merchant.id, name: 'Clé Test par défaut', key_hash: testKeyHash },
      { merchant_id: merchant.id, name: 'Clé Live par défaut', key_hash: liveKeyHash }
    ]);
  }

  return { success: true };
}
