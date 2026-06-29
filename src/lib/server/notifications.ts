import { sendEmail } from './mail';
import { createAdminClient } from '@/utils/supabase/admin';

export async function createNotification(
  merchantId: string, 
  type: string, 
  title: string, 
  message: string, 
  emailDest?: string,
  resourceId?: string
) {
  const supabase = createAdminClient();
  
  // Insert in-app notification
  const { error } = await supabase
    .from('notifications')
    .insert({
      merchant_id: merchantId,
      type,
      title,
      message,
      resource_id: resourceId
    });
    
  if (error) {
    // If it's a unique constraint violation (23505), it means this notification was already created
    if (error.code === '23505') {
      console.log(`Notification deduplicated: [${type}] for resource ${resourceId}`);
      return; // Do not send email again
    }
    console.error("Failed to insert notification:", error);
  }

  // Send Email if dest is provided
  if (emailDest) {
    const { data: merchantData } = await supabase
      .from('merchants')
      .select('current_environment')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantData?.current_environment !== 'test') {
      await sendEmail({
        to: emailDest,
        subject: title,
        text: message
      });
    } else {
      console.log(`[Mode Test] Email ignoré pour: ${emailDest} - ${title}`);
    }
  }

  // Send Push Notification
  try {
    const { data: devices } = await supabase
      .from('merchant_devices')
      .select('push_token, preferences')
      .eq('merchant_id', merchantId);

    if (devices && devices.length > 0) {
      const { sendPushNotification } = await import('@/lib/notifications/expo-push');
      for (const device of devices) {
        // Send push notification if they haven't disabled the relevant preference
        if (device.push_token) {
          await sendPushNotification(device.push_token, title, message, { type, resourceId });
        }
      }
    }
  } catch (err) {
    console.error("Failed to send push notifications:", err);
  }
}

export async function notifyAdminWithdrawalCreated(merchantId: string, amount: number, method: string, withdrawalId?: string) {
  const adminEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@kobara.app';
  const supabase = createAdminClient();
  const { data: merchant } = await supabase.from('merchants').select('business_name').eq('id', merchantId).single();
  const businessName = merchant?.business_name || 'Un marchand';

  await sendEmail({
    to: adminEmail,
    subject: `Nouveau retrait en attente - ${amount} HTG`,
    text: `Le marchand ${businessName} a demandé un retrait de ${amount} HTG via ${method}. Connectez-vous au panneau d'administration pour traiter cette demande.`,
  });
}

// 1. Nouvelle Paiement (succeeded)
export async function notifyPaymentSucceeded(merchantId: string, email: string, amount: number, currency: string, paymentId?: string) {
  await createNotification(
    merchantId,
    'payment_succeeded',
    'Paiement reçu',
    `Vous avez reçu un paiement de ${amount} ${currency}.`,
    email,
    paymentId
  );
}

export async function notifyPaymentCreated(merchantId: string, email: string, amount: number, currency: string, paymentId?: string) {
  await createNotification(
    merchantId,
    'payment_created',
    'Nouveau paiement créé',
    `Un paiement de ${amount} ${currency} est en attente.`,
    email,
    paymentId
  );
}

export async function notifyPaymentFailed(merchantId: string, email: string, amount: number, currency: string, paymentId?: string) {
  await createNotification(
    merchantId,
    'payment_failed',
    'Paiement échoué',
    `Un paiement de ${amount} ${currency} a échoué.`,
    email,
    paymentId
  );
}

// 2. Activation du Plan
export async function notifyPlanActivation(merchantId: string, email: string, planName: string) {
  await createNotification(
    merchantId,
    'plan_activated',
    'Plan activé avec succès',
    `Votre souscription au plan ${planName} est désormais active. Merci de votre confiance !`,
    email
  );
}

// 3. Rappel KYC
export async function notifyKycReminder(merchantId: string, email: string) {
  await createNotification(
    merchantId,
    'kyc_reminder',
    'Action requise : Vérification KYC',
    `Veuillez compléter votre vérification d'identité (KYC) pour débloquer toutes les fonctionnalités de votre compte et pouvoir effectuer des retraits.`,
    email
  );
}

// 4. Succès de changement de mot de passe
export async function notifyPasswordChange(merchantId: string, email: string) {
  await createNotification(
    merchantId,
    'security_alert',
    'Mot de passe modifié',
    `Le mot de passe de votre compte Kobara a été modifié avec succès. Si vous n'êtes pas à l'origine de cette action, contactez immédiatement le support.`,
    email
  );
}

// 5. Succès de KYC
export async function notifyKycSuccess(merchantId: string, email: string) {
  await createNotification(
    merchantId,
    'kyc_success',
    'Vérification KYC validée',
    `Félicitations ! Votre vérification d'identité (KYC) a été validée. Votre compte est maintenant entièrement opérationnel.`,
    email
  );
}

// 6. Révoquer API
export async function notifyApiKeyRevoked(merchantId: string, email: string, keyName: string) {
  await createNotification(
    merchantId,
    'security_alert',
    'Clé API révoquée',
    `La clé API nommée "${keyName}" a été révoquée. Elle ne peut plus être utilisée pour s'authentifier.`,
    email
  );
}

// 7. Activation sécurité 2FA
export async function notify2faActivation(merchantId: string, email: string, method: string) {
  await createNotification(
    merchantId,
    'security_alert',
    'Double authentification (2FA) activée',
    `La double authentification a été activée sur votre compte en utilisant la méthode : ${method}. Votre compte est maintenant plus sécurisé.`,
    email
  );
}

// 8. Activation Passkey
export async function notifyPasskeyAdded(merchantId: string, email: string) {
  await createNotification(
    merchantId,
    'security_alert',
    'Nouvelle clé biométrique (Passkey) ajoutée',
    `Un nouvel appareil a été enregistré pour la connexion biométrique (Passkey). Vous pouvez maintenant vous connecter sans mot de passe.`,
    email
  );
}

// 9. Retrait effectué avec succès
export async function notifyWithdrawalSuccess(merchantId: string, email: string, amount: number, withdrawalId?: string) {
  await createNotification(
    merchantId,
    'withdrawal_completed',
    '💸 Retrait complété',
    `Votre retrait de ${amount} HTG a été effectué avec succès.`,
    email,
    withdrawalId
  );
}

// 10. Retrait échoué
export async function notifyWithdrawalFailed(merchantId: string, email: string, amount: number, withdrawalId?: string) {
  await createNotification(
    merchantId,
    'withdrawal_failed',
    '⚠️ Retrait échoué',
    `Votre retrait de ${amount} HTG a échoué. Le montant a été recrédité sur votre solde disponible.`,
    email,
    withdrawalId
  );
}

// 11. Retrait créé
export async function notifyWithdrawalCreated(merchantId: string, email: string, amount: number, withdrawalId?: string) {
  await createNotification(
    merchantId,
    'withdrawal_created',
    'Demande de retrait',
    `Votre demande de retrait de ${amount} HTG a été reçue et est en cours de traitement.`,
    email,
    withdrawalId
  );
}

// B2B Transfers
export async function notifyB2BTransferSent(senderId: string, email: string, amount: number, receiverEmail: string) {
  const title = "Transfert B2B Envoyé";
  const message = `Vous avez envoyé avec succès un transfert B2B de ${amount.toLocaleString('fr-FR')} HTG à ${receiverEmail}.`;
  await createNotification(senderId, 'b2b.sent', title, message, email);
}

export async function notifyB2BTransferReceived(receiverId: string, email: string, amount: number, senderName: string) {
  const title = "Transfert B2B Reçu";
  const message = `Vous avez reçu un transfert B2B de ${amount.toLocaleString('fr-FR')} HTG de la part de ${senderName}.`;
  await createNotification(receiverId, 'b2b.received', title, message, email);
}

// ---------------------------------------------------------------------------
// SUBSCRIPTIONS & CRON
// ---------------------------------------------------------------------------

export async function notifySubscriptionWarning(merchantId: string, email: string, daysLeft: number) {
  await createNotification(
    merchantId,
    'subscription_warning',
    'Action requise : Renouvellement imminent',
    `Votre abonnement expire dans ${daysLeft} jours. Votre solde est insuffisant pour un renouvellement automatique. Veuillez recharger votre solde ou renouveler manuellement avec NatCash/MonCash.`,
    email
  );
}

export async function notifySubscriptionRenewed(merchantId: string, email: string, planName: string, amount: number) {
  await createNotification(
    merchantId,
    'subscription_renewed',
    'Renouvellement automatique réussi',
    `Votre abonnement au plan ${planName} a été renouvelé avec succès (${amount} HTG ont été déduits de votre solde).`,
    email
  );
}

export async function notifySubscriptionGracePeriod(merchantId: string, email: string, daysGrace: number) {
  await createNotification(
    merchantId,
    'subscription_grace_period',
    'Abonnement expiré',
    `Votre abonnement a expiré. Vous disposez d'une période de grâce de ${daysGrace} jours avant d'être rétrogradé au plan Free. Renouvelez vite via MonCash ou NatCash.`,
    email
  );
}

export async function notifySubscriptionDowngraded(merchantId: string, email: string) {
  await createNotification(
    merchantId,
    'subscription_downgraded',
    'Fin de la période de grâce',
    `Votre période de grâce a pris fin. Vous avez été rétrogradé au plan Free.`,
    email
  );
}
