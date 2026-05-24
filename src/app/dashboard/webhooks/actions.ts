'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function addWebhookEndpoint(url: string) {
  const { merchant } = await getCurrentUserAndMerchant();
  const supabaseAdmin = createAdminClient();

  // Generate a webhook secret for HMAC signing
  const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

  const { error } = await supabaseAdmin
    .from('webhook_endpoints')
    .insert({
      merchant_id: merchant.id,
      url: url,
      secret: secret,
      status: 'active'
    });

  if (error) {
    throw new Error("Failed to create webhook endpoint");
  }

  revalidatePath('/dashboard/webhooks');
}

export async function deleteWebhookEndpoint(id: string) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();
  const supabaseAdmin = createAdminClient();

  // Find endpoint to verify ownership (RLS allows select)
  const { data: endpoint } = await supabase
    .from('webhook_endpoints')
    .select('merchant_id')
    .eq('id', id)
    .single();

  if (!endpoint || endpoint.merchant_id !== merchant.id) {
    throw new Error("Webhook endpoint not found ou accès refusé");
  }

  const { error } = await supabaseAdmin
    .from('webhook_endpoints')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error("Failed to delete webhook endpoint");
  }

  revalidatePath('/dashboard/webhooks');
}


export async function resendWebhookEvent(eventId: string) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();
  const supabaseAdmin = createAdminClient();

  const { data: event } = await supabase
    .from('webhook_events')
    .select('merchant_id')
    .eq('id', eventId)
    .single();

  if (!event || event.merchant_id !== merchant.id) {
    throw new Error('Event not found or access denied');
  }

  const { error } = await supabaseAdmin
    .from('webhook_events')
    .update({
      delivery_status: 'pending',
      retry_count: 0
    })
    .eq('id', eventId);

  if (error) {
    throw new Error('Failed to resend webhook');
  }

  revalidatePath('/dashboard/webhooks');
}
