'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { sendEmail } from "@/lib/server/mail";
import { createAdminClient } from "@/utils/supabase/admin";

export async function submitSupportTicket(formData: {
  subject: string;
  category: string;
  message: string;
}) {
  try {
    const { user, merchant } = await getCurrentUserAndMerchant();
    
    // We can also insert this into a 'support_tickets' table if it existed,
    // but for now we just send an email to the support team as requested.
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@kobara.app';
    
    const emailText = `
Nouveau ticket de support de la part de :
Marchand : ${merchant.business_name} (${merchant.id})
Email : ${merchant.email || user.email}
Téléphone : ${merchant.phone || 'Non renseigné'}
Catégorie : ${formData.category}

Message :
${formData.message}
    `;

    await sendEmail({
      to: supportEmail,
      subject: `[Support - ${formData.category}] ${formData.subject}`,
      text: emailText
    });

    // Optionnel : Envoyer un email de confirmation au marchand
    await sendEmail({
      to: merchant.email || user.email,
      subject: `Confirmation de réception : ${formData.subject}`,
      text: `Bonjour ${merchant.business_name},\n\nNous avons bien reçu votre demande de support concernant "${formData.subject}".\n\nNotre équipe vous répondra dans les plus brefs délais.\n\nRappel de votre message :\n${formData.message}`
    });

    return { success: true };
  } catch (error: any) {
    console.error("Support Ticket Error:", error);
    return { error: "Erreur lors de l'envoi de la demande de support." };
  }
}
