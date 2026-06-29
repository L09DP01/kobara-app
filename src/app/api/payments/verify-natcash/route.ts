import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { upgradeMerchantPlan } from "@/lib/server/plans";
import { notifyPaymentSucceeded } from '@/lib/server/notifications';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, transCode } = await request.json();

    if (!paymentId || !transCode) {
      return NextResponse.json({ error: "Les informations de paiement sont incomplètes." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Vérifier le paiement
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Paiement introuvable, contacter l'administrateur." }, { status: 404 });
    }

    // Si le paiement est déjà validé
    if (payment.status === 'succeeded') {
      return NextResponse.json({ success: true, message: "Paiement déjà validé !" });
    }

    // 2. Chercher dans sms_inbox si ce transCode a été reçu
    // On utilise ilike sur le raw_message car c'est un numéro unique très long
    const { data: smsList } = await supabase
      .from('sms_inbox')
      .select('*')
      .eq('source', 'natcash')
      .ilike('raw_message', `%${transCode}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!smsList || smsList.length === 0) {
      return NextResponse.json({ 
        error: "Paiement non trouvé, contacter l'administrateur." 
      }, { status: 404 });
    }

    const sms = smsList[0];
    const parsed = sms.parsed_json;

    // Optionnel : vérifier si le montant correspond à peu près (marge de 5 HTG)
    if (parsed && parsed.amount) {
      const diff = Math.abs(Number(parsed.amount) - Number(payment.amount));
      if (diff > 5) {
        return NextResponse.json({ 
          error: `Le montant du transfert (${parsed.amount} HTG) ne correspond pas au montant requis (${payment.amount} HTG). Veuillez contacter l'administrateur.` 
        }, { status: 400 });
      }
    }

    // 3. Valider le paiement
    await supabase.from('payments').update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      trans_code: transCode
    }).eq('id', payment.id);

    // Mettre à jour le statut du SMS pour dire qu'il a été lié manuellement
    await supabase.from('sms_inbox').update({
      status: 'processed',
      payment_id: payment.id,
      error_reason: 'Validated manually via UI transCode check'
    }).eq('id', sms.id);

    // 4. Activer le plan
    const metadata = payment.metadata as any;
    if (metadata && metadata.is_subscription_upgrade && metadata.plan_slug) {
      try {
        await upgradeMerchantPlan(payment.merchant_id, metadata.plan_slug);
      } catch (err) {
        console.error(`Erreur upgrade plan via verify-natcash:`, err);
      }
    } else {
      // Notification classique si ce n'est pas un abonnement
      try {
        const { data: merchantData } = await supabase.from('merchants').select('email').eq('id', payment.merchant_id).single();
        if (merchantData?.email) {
          await notifyPaymentSucceeded(payment.merchant_id, merchantData.email, payment.amount, 'HTG', payment.id);
        }
      } catch(e) { console.error("Notification failed", e); }
    }

    return NextResponse.json({ success: true, message: "Paiement validé avec succès !" });

  } catch (error: any) {
    console.error("verify-natcash error:", error);
    return NextResponse.json({ error: "Erreur interne, contacter l'administrateur." }, { status: 500 });
  }
}
