import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { createAdminClient } from "./admin";
import { createClient } from "./server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUserAndMerchant() {
  const session = await getServerSession(authOptions) as any;
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const supabaseAdmin = createAdminClient();
  const { data: merchant } = await supabaseAdmin
    .from("merchants")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant || !merchant.phone || !merchant.category) {
    redirect("/onboarding");
  }

  // Auto-expire pending payments older than 24 hours
  await expireMerchantOldPayments(merchant.id);

  // Create an RLS-enabled client for the current user
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore, session?.supabaseAccessToken);

  return { user, merchant, supabase };
}

async function triggerExpiredWebhooks(merchantId: string, expiredPayments: any[]) {
  try {
    const supabaseAdmin = createAdminClient();
    const { data: endpoints } = await supabaseAdmin
      .from('webhook_endpoints')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'active');

    if (!endpoints || endpoints.length === 0) return;

    const crypto = await import('crypto');

    for (const p of expiredPayments) {
      const eventPayload = {
        event: `payment.failed`,
        data: {
          id: p.id,
          reference: p.kobara_reference,
          amount: p.amount,
          net_amount: p.net_amount || p.amount,
          currency: p.currency || 'HTG',
          status: 'failed',
          reason: 'expired'
        }
      };

      for (const endpoint of endpoints) {
        try {
          const signature = crypto.createHmac('sha256', endpoint.secret)
            .update(JSON.stringify(eventPayload))
            .digest('hex');

          fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Kobara-Signature': signature,
              'Kobara-Event': eventPayload.event
            },
            body: JSON.stringify(eventPayload)
          }).catch(err => console.error(`Failed to post webhook to ${endpoint.url}:`, err));
        } catch (err) {
          console.error(`Failed to prepare webhook for ${endpoint.url}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Error triggering expired webhooks:", err);
  }
}

export async function expireMerchantOldPayments(merchantId: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Get all pending payments older than 24 hours for this merchant
    const { data: expiredPayments } = await supabaseAdmin
      .from('payments')
      .select('id, amount, kobara_reference, net_amount, currency')
      .eq('merchant_id', merchantId)
      .eq('status', 'pending')
      .lt('created_at', yesterday.toISOString());

    if (expiredPayments && expiredPayments.length > 0) {
      const expiredIds = expiredPayments.map(p => p.id);
      
      // Update payments to failed (expired)
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .in('id', expiredIds);

      // Create notifications for the merchant
      const notifications = expiredPayments.map(p => ({
        merchant_id: merchantId,
        type: 'payment_failed',
        title: '❌ Paiement expiré',
        message: `Un paiement en attente de ${p.amount} HTG (Réf: ${p.kobara_reference}) a expiré après 24h sans validation.`
      }));

      await supabaseAdmin.from('notifications').insert(notifications);

      // Trigger webhooks for the expired payments in the background
      triggerExpiredWebhooks(merchantId, expiredPayments).catch(err => {
        console.error("Failed to trigger background webhooks:", err);
      });
    }
  } catch (e) {
    console.error("Error auto-expiring payments:", e);
  }
}
