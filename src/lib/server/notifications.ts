import { sendEmail } from './mail';
import { createAdminClient } from '@/utils/supabase/admin';

export async function createNotification(
  merchantId: string, 
  type: string, 
  title: string, 
  message: string, 
  emailDest?: string
) {
  const supabase = createAdminClient();
  
  // Insert in-app notification
  const { error } = await supabase
    .from('notifications')
    .insert({
      merchant_id: merchantId,
      type,
      title,
      message
    });
    
  if (error) {
    console.error("Failed to insert notification:", error);
  }

  // Send Email if dest is provided
  if (emailDest) {
    await sendEmail({
      to: emailDest,
      subject: title,
      text: message
    });
  }
}

// 1. Nouvelle Paiement (succeeded)
export async function notifyPaymentSucceeded(merchantId: string, email: string, amount: number, currency: string) {
  await createNotification(
    merchantId,
    'payment_succeeded',
    'Paiement reçu',
    `Vous avez reçu un paiement de ${amount} ${currency}.`,
    email
  );
}

export async function notifyPaymentCreated(merchantId: string, email: string, amount: number, currency: string) {
  await createNotification(
    merchantId,
    'payment_created',
    'Nouveau paiement créé',
    `Un paiement de ${amount} ${currency} est en attente.`,
    email
  );
}

export async function notifyPaymentFailed(merchantId: string, email: string, amount: number, currency: string) {
  await createNotification(
    merchantId,
    'payment_failed',
    'Paiement échoué',
    `Un paiement de ${amount} ${currency} a échoué.`,
    email
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
export async function notifyWithdrawalSuccess(merchantId: string, email: string, amount: number) {
  await createNotification(
    merchantId,
    'withdrawal_completed',
    '💸 Retrait complété',
    `Votre retrait de ${amount} HTG a été envoyé avec succès à votre compte MonCash.`,
    email
  );
}

// 10. Retrait échoué
export async function notifyWithdrawalFailed(merchantId: string, email: string, amount: number) {
  await createNotification(
    merchantId,
    'withdrawal_failed',
    '⚠️ Retrait échoué',
    `Votre retrait de ${amount} HTG a échoué. Le montant a été recrédité sur votre solde disponible.`,
    email
  );
}

// 11. Retrait créé
export async function notifyWithdrawalCreated(merchantId: string, email: string, amount: number) {
  await createNotification(
    merchantId,
    'withdrawal_created',
    'Demande de retrait',
    `Votre demande de retrait de ${amount} HTG a été reçue et est en cours de traitement.`,
    email
  );
}
