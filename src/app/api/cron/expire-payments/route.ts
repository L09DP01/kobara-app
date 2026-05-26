import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // MED-01: CRON_SECRET is mandatory — reject if not configured
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();

    // Calculate 24 hours ago
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Get all pending payments older than 24 hours
    const { data: expiredPayments, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('id, merchant_id, kobara_reference, amount, net_amount, currency')
      .eq('status', 'pending')
      .lt('created_at', yesterday.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredPayments || expiredPayments.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No expired payments found" });
    }

    // Update payments to failed
    const expiredIds = expiredPayments.map(p => p.id);
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status: 'failed' })
      .in('id', expiredIds);

    if (updateError) {
      throw updateError;
    }

    // Process notifications and webhooks for each expired payment
    const notifications = [];
    for (const p of expiredPayments) {
      // Add notification
      notifications.push({
        merchant_id: p.merchant_id,
        type: 'payment_failed',
        title: '❌ Paiement expiré',
        message: `Un paiement en attente de ${p.amount} HTG (Réf: ${p.kobara_reference}) a expiré après 24h sans validation.`
      });

      // Send outbound webhooks
      const { data: endpoints } = await supabaseAdmin
        .from('webhook_endpoints')
        .select('*')
        .eq('merchant_id', p.merchant_id)
        .eq('status', 'active');

      if (endpoints && endpoints.length > 0) {
        const eventPayload = {
          event: `payment.failed`,
          data: {
            id: p.id,
            reference: p.kobara_reference,
            amount: p.amount,
            net_amount: p.net_amount,
            currency: p.currency,
            status: 'failed',
            reason: 'expired'
          }
        };

        for (const endpoint of endpoints) {
          try {
            const signature = crypto.createHmac('sha256', endpoint.secret)
              .update(JSON.stringify(eventPayload))
              .digest('hex');

            await fetch(endpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Kobara-Signature': signature,
                'Kobara-Event': eventPayload.event
              },
              body: JSON.stringify(eventPayload)
            });
          } catch (err) {
            console.error(`Failed to send webhook to ${endpoint.url}:`, err);
          }
        }
      }
    }

    await supabaseAdmin.from('notifications').insert(notifications);

    return NextResponse.json({ 
      success: true, 
      count: expiredPayments.length, 
      message: `Expired ${expiredPayments.length} payments` 
    });

  } catch (error: any) {
    console.error("Error expiring payments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
