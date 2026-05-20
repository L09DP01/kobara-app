'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function addWebhookEndpoint(url: string) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  // Generate a webhook secret for HMAC signing
  const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

  const { error } = await supabase
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

  // Find endpoint to verify ownership
  const { data: endpoint } = await supabase
    .from('webhook_endpoints')
    .select('merchant_id')
    .eq('id', id)
    .single();

  if (!endpoint || endpoint.merchant_id !== merchant.id) {
    throw new Error("Webhook endpoint not found ou accès refusé");
  }

  const { error } = await supabase
    .from('webhook_endpoints')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error("Failed to delete webhook endpoint");
  }

  revalidatePath('/dashboard/webhooks');
}

