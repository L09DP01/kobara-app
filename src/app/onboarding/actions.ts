'use server'

import { createAdminClient } from "@/utils/supabase/admin";
import { ApiKeySecurity } from "@/lib/server/security/api-keys";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function completeOnboarding(formData: {
  first_name: string;
  last_name: string;
  business_name: string;
  category: string;
  phone: string;
  address: string;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user) {
    return { error: "Vous devez être connecté pour finaliser votre inscription." };
  }

  const supabase = createAdminClient();

  // 1. Update User names in public.users table
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      first_name: formData.first_name,
      last_name: formData.last_name,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (userUpdateError) {
    console.error("Erreur mise à jour utilisateur:", userUpdateError);
    return { error: "Erreur lors de la mise à jour de vos informations personnelles." };
  }

  // 2. Generate a unique business slug
  const baseSlug = formData.business_name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, '');       // remove leading/trailing dashes
  
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const businessSlug = `${baseSlug}-${randomSuffix}`;

  // 3. Create or update the merchant profile
  const { data: existingMerchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  let error;
  if (existingMerchant) {
    const { error: updateError } = await supabase
      .from('merchants')
      .update({
        business_name: formData.business_name,
        business_slug: businessSlug,
        category: formData.category,
        phone: formData.phone,
        address: formData.address || null,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMerchant.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('merchants')
      .insert({
        user_id: user.id,
        email: user.email,
        business_name: formData.business_name,
        business_slug: businessSlug,
        category: formData.category,
        phone: formData.phone,
        address: formData.address || null,
        status: 'active',
        available_balance: 0,
        pending_balance: 0
      });
    error = insertError;
  }

  if (error) {
    console.error("Erreur onboarding:", error);
    return { error: "Erreur lors de la configuration du profil marchand. " + error.message };
  }

  // 4. Generate default API keys for the merchant if they don't already exist
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchant) {
    // Check if keys already exist
    const { count: keysCount } = await supabase
      .from('api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id);

    if (!keysCount || keysCount === 0) {
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
  }

  return { success: true };
}

