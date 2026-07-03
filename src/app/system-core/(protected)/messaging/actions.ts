'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/lib/server/mail";

export async function getAdminMerchants() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('merchants')
    .select('id, business_name, email')
    .order('business_name', { ascending: true });
  
  return data || [];
}

export async function sendAdminMessage(formData: FormData) {
  const merchantId = formData.get('merchantId') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!merchantId || !subject || !message) {
    return { error: 'Tous les champs sont requis' };
  }

  const supabase = createAdminClient();

  // Get merchant email
  const { data: merchant } = await supabase
    .from('merchants')
    .select('email, business_name')
    .eq('id', merchantId)
    .single();

  if (!merchant?.email) {
    return { error: 'Marchand introuvable ou email manquant' };
  }

  try {
    // Send email
    await sendEmail({
      to: merchant.email,
      subject: `Kobara — ${subject}`,
      text: message,
    });

    // Log it in notifications
    await supabase.from('notifications').insert({
      merchant_id: merchantId,
      type: 'admin_message',
      title: subject,
      message: message,
      read: false,
    });

    return { success: true, email: merchant.email, business_name: merchant.business_name };
  } catch (e: any) {
    return { error: e.message || 'Erreur lors de l\'envoi' };
  }
}
