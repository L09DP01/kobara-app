import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { AdminWithdrawalsClient } from "./withdrawals-admin-client";

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient();

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select(`*, merchants ( business_name, email, available_balance, available_balance_test )`)
    .order('created_at', { ascending: false });

  // ---- Server Actions ----

  async function approveManualWithdrawal(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;
    const total = Number(formData.get('total'));
    const environment = formData.get('environment') as string || 'live';

    const adminClient = createAdminClient();

    // 1. Déduire le solde maintenant (en tenant compte de l'environnement)
    const { data: merchant } = await adminClient.from('merchants').select('available_balance, available_balance_test').eq('id', merchantId).single();
    if (merchant) {
      const isTest = environment === 'test';
      const currentBalance = isTest
        ? Number(merchant.available_balance_test || 0)
        : Number(merchant.available_balance || 0);
      const newBalance = Math.max(0, currentBalance - total);

      const updateData = isTest
        ? { available_balance_test: newBalance }
        : { available_balance: newBalance };

      await adminClient.from('merchants').update(updateData).eq('id', merchantId);
    }

    // 2. Marquer comme complété
    await adminClient.from('withdrawals').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', id);

    // 3. Notifier le marchand du succès
    try {
      const { data: w } = await adminClient.from('withdrawals').select('amount, total').eq('id', id).single();
      const { notifyWithdrawalSuccess } = await import('@/lib/server/notifications');
      if (w) {
        const { data: mData } = await adminClient.from('merchants').select('email').eq('id', merchantId).single();
        if (mData) await notifyWithdrawalSuccess(merchantId, mData.email, w.total || w.amount);
      }
    } catch(e) { console.error("Notify failed", e); }

    revalidatePath('/system-core/withdrawals');
  }

  async function rejectManualWithdrawal(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;
    const reason = formData.get('reason') as string || 'Aucune raison spécifiée';
    const total = Number(formData.get('total') || 0);
    const environment = formData.get('environment') as string || 'live';

    const adminClient = createAdminClient();

    // 1. Vérifier si le solde avait déjà été déduit (pour MonCash en pending)
    //    Pour NatCash/Zelle pending_approval, le solde n'a PAS été déduit,
    //    mais pour MonCash pending, il l'a été. On re-crédite dans tous les cas
    //    s'il y avait une déduction.
    const { data: withdrawal } = await adminClient.from('withdrawals').select('*').eq('id', id).single();
    
    if (withdrawal) {
      const wasPending = withdrawal.status === 'pending'; // MonCash: balance was already deducted
      
      if (wasPending && total > 0) {
        // Recréditer le solde puisqu'il avait été déduit à la création
        const { data: merchant } = await adminClient.from('merchants')
          .select('available_balance, available_balance_test')
          .eq('id', merchantId).single();

        if (merchant) {
          const isTest = environment === 'test';
          const currentBalance = isTest
            ? Number(merchant.available_balance_test || 0)
            : Number(merchant.available_balance || 0);
          
          const updateData = isTest
            ? { available_balance_test: currentBalance + total }
            : { available_balance: currentBalance + total };

          await adminClient.from('merchants').update(updateData).eq('id', merchantId);
        }
      }
      // Pour pending_approval (NatCash/Zelle), le solde n'a jamais été déduit, pas de refund nécessaire
    }

    // 2. Marquer comme rejeté avec la raison
    const { error: updateError } = await adminClient.from('withdrawals').update({
      status: 'rejected',
      completed_at: new Date().toISOString(),
      rejection_reason: reason
    }).eq('id', id);

    if (updateError) {
      console.error("Error updating withdrawal status:", updateError);
      // Fallback au cas où la colonne rejection_reason n'existe pas encore en base de données
      const { error: fallbackError } = await adminClient.from('withdrawals').update({
        status: 'rejected',
        completed_at: new Date().toISOString()
      }).eq('id', id);
      if (fallbackError) console.error("Fallback error:", fallbackError);
    }

    // 3. Notifier le marchand du rejet avec la raison (email + notification in-app)
    try {
      const { data: mData } = await adminClient.from('merchants').select('email').eq('id', merchantId).single();
      if (mData?.email) {
        // Notification in-app (qui envoie aussi l'email car l'email est passé en paramètre)
        const { createNotification } = await import('@/lib/server/notifications');
        await createNotification(
          merchantId,
          'withdrawal_rejected',
          '❌ Votre demande de retrait a été refusée',
          `Bonjour,\n\nVotre récente demande de retrait de ${total} HTG a été examinée et refusée par notre équipe.\n\n📋 Raison du refus :\n${reason}\n\n💰 Votre solde n'a pas été affecté. Vous pouvez soumettre une nouvelle demande si nécessaire.\n\nCordialement,\nL'équipe Kobara`,
          mData.email
        );
      }
    } catch(e) { console.error("Reject notification failed", e); }

    revalidatePath('/system-core/withdrawals');
  }

  async function markAsPaid(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const merchantId = formData.get('merchant_id') as string;

    const adminClient = createAdminClient();

    await adminClient.from('withdrawals').update({
      status: 'paid',
      completed_at: new Date().toISOString()
    }).eq('id', id);

    // Notifier le marchand
    try {
      const { data: w } = await adminClient.from('withdrawals').select('amount, total').eq('id', id).single();
      const { notifyWithdrawalSuccess } = await import('@/lib/server/notifications');
      if (w && merchantId) {
        const { data: mData } = await adminClient.from('merchants').select('email').eq('id', merchantId).single();
        if (mData) await notifyWithdrawalSuccess(merchantId, mData.email, w.total || w.amount);
      }
    } catch(e) { console.error("Mark as paid notify failed", e); }

    revalidatePath('/system-core/withdrawals');
  }

  return (
    <AdminWithdrawalsClient
      withdrawals={withdrawals || []}
      approveAction={approveManualWithdrawal}
      rejectAction={rejectManualWithdrawal}
      markAsPaidAction={markAsPaid}
    />
  );
}
