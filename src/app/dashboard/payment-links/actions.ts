'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function createPaymentLink(formData: FormData) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string;

  if (!title) {
    return { error: "Le titre est requis" };
  }

  const amount = amountStr ? parseFloat(amountStr) : null;

  const { createAdminClient } = require("@/utils/supabase/admin");
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('payment_links')
    .insert({
      merchant_id: merchant.id,
      title,
      amount,
      description,
      status: 'active',
      slug: crypto.randomUUID().replace(/-/g, '').substring(0, 10),
      currency: 'HTG'
    });

  if (error) {
    console.error("Erreur lors de la création du lien de paiement:", error);
    return { error: "Erreur lors de la création du lien de paiement: " + error.message };
  }

  revalidatePath('/dashboard/payment-links');
  return { success: true };
}

export async function updatePaymentLink(formData: FormData) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string;

  if (!id || !title) {
    throw new Error("ID et Titre sont requis");
  }

  // Find payment link to verify ownership (with RLS, the update will just fail if they don't own it)
  // But doing a select first gives a better error message.
  const { data: linkInfo } = await supabase
    .from('payment_links')
    .select('merchant_id')
    .eq('id', id)
    .single();

  if (!linkInfo || linkInfo.merchant_id !== merchant.id) {
    throw new Error("Lien de paiement non trouvé ou accès refusé");
  }

  const amount = amountStr ? parseFloat(amountStr) : null;

  const { error } = await supabase
    .from('payment_links')
    .update({
      title,
      amount,
      description,
    })
    .eq('id', id);

  if (error) {
    console.error("Erreur lors de la modification du lien de paiement:", error);
    throw new Error("Erreur lors de la modification du lien de paiement");
  }

  revalidatePath('/dashboard/payment-links');
  redirect('/dashboard/payment-links');
}
