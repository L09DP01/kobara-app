import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { 
  notifySubscriptionWarning, 
  notifySubscriptionRenewed, 
  notifySubscriptionGracePeriod, 
  notifySubscriptionDowngraded 
} from '@/lib/server/notifications';
import { randomUUID } from 'crypto';

// Protect this endpoint from unauthorized access
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Fetch all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plans:plan_slug (*)')
      .eq('status', 'active');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let processedCount = 0;

    for (const sub of subscriptions) {
      // Calcul des jours avant expiration
      if (!sub.current_period_end) continue;
      
      const expiryDate = new Date(sub.current_period_end);
      expiryDate.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Récupération du merchant
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id, available_balance, email')
        .eq('id', sub.merchant_id)
        .single();

      if (!merchant) continue;

      const balance = Number(merchant.available_balance || 0);
      const amount = Number(sub.amount_htg || 0);

      // Scénario A : J-5 (Avertissement si solde insuffisant)
      if (daysLeft === 5) {
        if (balance < amount) {
          await notifySubscriptionWarning(merchant.id, merchant.email, 5);
          processedCount++;
        }
      } 
      // Scénario B : Jour J ou pendant la période de grâce (tentative de paiement)
      else if (daysLeft <= 0 && daysLeft > -5) {
        if (balance >= amount) {
          // Solde suffisant : Renouvellement automatique
          const newBalance = balance - amount;
          
          // Mise à jour solde
          await supabase
            .from('merchants')
            .update({ available_balance: newBalance })
            .eq('id', merchant.id);

          // Calcul nouvelle date
          const nextEnd = new Date(expiryDate);
          if (sub.billing_cycle === 'yearly') {
            nextEnd.setFullYear(nextEnd.getFullYear() + 1);
          } else {
            nextEnd.setMonth(nextEnd.getMonth() + 1);
          }

          // Maj abonnement
          await supabase
            .from('subscriptions')
            .update({ current_period_end: nextEnd.toISOString() })
            .eq('id', sub.id);

          // Ajout historique
          await supabase
            .from('withdrawals')
            .insert({
              merchant_id: merchant.id,
              kobara_reference: `SUB_${randomUUID().substring(0, 8).toUpperCase()}`,
              amount: amount,
              fees: 0,
              total: amount,
              wallet: "Kobara Wallet",
              description: "Renouvellement automatique d'abonnement",
              status: "completed",
              environment: "live" // default for cron
            });

          await notifySubscriptionRenewed(merchant.id, merchant.email, sub.plans?.name || sub.plan_slug, amount);
          processedCount++;
        } else {
          // Solde toujours insuffisant
          if (daysLeft === 0) {
            // Le premier jour de la période de grâce, on notifie
            await notifySubscriptionGracePeriod(merchant.id, merchant.email, 5);
            processedCount++;
          }
        }
      }
      // Scénario C : J+5 (Fin de période de grâce, on rétrograde)
      else if (daysLeft <= -5) {
        // Rétrograde vers le plan free
        await supabase
          .from('merchants')
          .update({ plan_slug: 'free', plan_status: 'active' })
          .eq('id', merchant.id);

        // Annuler l'abonnement actif
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', sub.id);

        await notifySubscriptionDowngraded(merchant.id, merchant.email);
        processedCount++;
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
