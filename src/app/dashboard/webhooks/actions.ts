'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function addWebhookEndpoint(url: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    throw new Error("Merchant not found");
  }

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('webhook_endpoints')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error("Failed to delete webhook endpoint");
  }

  revalidatePath('/dashboard/webhooks');
}
