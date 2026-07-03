'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getPromoCodes() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('promo_codes')
    .select(`
      *,
      plan:plans (name),
      merchant:merchants (business_name, email)
    `)
    .order('created_at', { ascending: false });
  
  return data || [];
}

export async function createPromoCode(formData: FormData) {
  const code = formData.get('code') as string;
  const discountStr = formData.get('discount_percentage') as string;
  const isCumulable = formData.get('is_cumulable') === 'true';
  const isRecurring = formData.get('is_recurring') === 'true';
  const planId = formData.get('plan_id') as string;
  const merchantId = formData.get('merchant_id') as string;
  const maxUsesStr = formData.get('max_uses') as string;
  const expiresAtStr = formData.get('expires_at') as string;

  if (!code || !discountStr) {
    return { error: 'Le code et le pourcentage sont requis' };
  }

  const discount_percentage = parseFloat(discountStr);
  if (isNaN(discount_percentage) || discount_percentage <= 0 || discount_percentage > 100) {
    return { error: 'Le pourcentage doit être entre 1 et 100' };
  }

  const max_uses = maxUsesStr ? parseInt(maxUsesStr) : null;
  if (max_uses !== null && isNaN(max_uses)) {
    return { error: 'Nombre d\'utilisations invalide' };
  }

  const payload: any = {
    code: code.trim().toUpperCase(),
    discount_percentage,
    is_cumulable: isCumulable,
    is_recurring: isRecurring,
    plan_id: planId || null,
    merchant_id: merchantId || null,
    max_uses,
    expires_at: expiresAtStr ? new Date(expiresAtStr).toISOString() : null,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from('promo_codes').insert(payload);

  if (error) {
    return { error: error.message || 'Erreur lors de la création du code' };
  }

  revalidatePath('/system-core/promo-codes');
  return { success: true };
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('promo_codes').update({ is_active: isActive }).eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/system-core/promo-codes');
  return { success: true };
}

export async function deletePromoCode(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/system-core/promo-codes');
  return { success: true };
}
