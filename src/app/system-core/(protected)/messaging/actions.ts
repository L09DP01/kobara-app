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

export async function sendBulkAdminMessage(merchantIds: string[], subject: string, message: string) {
  if (!merchantIds.length || !subject || !message) {
    return { error: 'Sélectionnez au moins un marchand et remplissez tous les champs' };
  }

  const supabase = createAdminClient();

  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, email, business_name')
    .in('id', merchantIds);

  if (!merchants?.length) {
    return { error: 'Aucun marchand trouvé' };
  }

  const results: { email: string; business_name: string; success: boolean; error?: string }[] = [];

  for (const merchant of merchants) {
    try {
      await sendEmail({
        to: merchant.email,
        subject: `Kobara — ${subject}`,
        text: message,
      });

      await supabase.from('notifications').insert({
        merchant_id: merchant.id,
        type: 'admin_message',
        title: subject,
        message: message,
        read: false,
      });

      results.push({ email: merchant.email, business_name: merchant.business_name, success: true });
    } catch (e: any) {
      results.push({ email: merchant.email, business_name: merchant.business_name, success: false, error: e.message });
    }
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return { success: true, results, sent, failed, total: merchants.length };
}
