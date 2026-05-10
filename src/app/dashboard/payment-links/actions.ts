'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPaymentLink(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Obtenir le merchant_id actuel
  let merchantId = null;

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchant) {
    merchantId = merchant.id;
  } else {
    const { data: member } = await supabase
      .from('merchant_members')
      .select('merchant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (member) {
      merchantId = member.merchant_id;
    }
  }

  if (!merchantId) {
    throw new Error("Merchant non trouvé");
  }

  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string;

  if (!title) {
    throw new Error("Le titre est requis");
  }

  const amount = amountStr ? parseFloat(amountStr) : null;

  const { error } = await supabase
    .from('payment_links')
    .insert({
      merchant_id: merchantId,
      title,
      amount,
      description,
      status: 'active',
      slug: crypto.randomUUID().replace(/-/g, '').substring(0, 10),
      currency: 'HTG'
    });

  if (error) {
    console.error("Erreur lors de la création du lien de paiement:", error);
    throw new Error("Erreur lors de la création du lien de paiement");
  }

  revalidatePath('/dashboard/payment-links');
  redirect('/dashboard/payment-links');
}

export async function updatePaymentLink(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string;

  if (!id || !title) {
    throw new Error("ID et Titre sont requis");
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
