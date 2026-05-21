'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: { name: string, email: string, phone: string }) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { error } = await supabase
    .from('customers')
    .insert({
      merchant_id: merchant.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });

  if (error) {
    throw new Error(error.message || "Erreur lors de la création du client");
  }

  revalidatePath('/dashboard/customers');
  return { success: true };
}
