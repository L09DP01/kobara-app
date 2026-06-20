// Module d'envoi d'e-mails pour Kobara utilisant Resend
// Fonctionne de manière native sur les environnements Edge et Serverless comme Vercel

type EmailTemplateProps = {
  subject: string;
  greeting?: string;
  paragraphs: string[];
  cta?: { text: string; url: string };
  secondaryInfo?: { label: string; value: string }[];
  alertType?: 'info' | 'warning' | 'critical';
};

function renderEmailTemplate({ subject, greeting, paragraphs, cta, secondaryInfo, alertType }: EmailTemplateProps) {
  let headerBg = '#F9FAFB';
  let headerColor = '#E53E3E'; // Rouge Kobara
  
  if (alertType === 'warning') {
    headerBg = '#FFFBEB';
    headerColor = '#D97706';
  } else if (alertType === 'critical') {
    headerBg = '#FEF2F2';
    headerColor = '#DC2626';
  }

  const pStyle = "color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;";

  const greetingHtml = greeting ? `<p style="${pStyle} font-weight: 600; color: #111827;">${greeting}</p>` : '';
  const paragraphsHtml = paragraphs.map(p => `<p style="${pStyle}">${p}</p>`).join('');
  
  const ctaHtml = cta ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${cta.url}" style="background-color: ${headerColor}; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        ${cta.text}
      </a>
    </div>
  ` : '';

  const secondaryHtml = secondaryInfo && secondaryInfo.length > 0 ? `
    <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin-top: 32px;">
      ${secondaryInfo.map(info => `
        <div style="margin-bottom: 8px; font-size: 14px;">
          <strong style="color: #374151;">${info.label}:</strong> <span style="color: #6B7280;">${info.value}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Card -->
    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background-color: ${headerBg}; padding: 32px 40px; text-align: center; border-bottom: 1px solid #E5E7EB;">
        <h1 style="color: ${headerColor}; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Kobara</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 24px;">${subject}</h2>
        
        ${greetingHtml}
        ${paragraphsHtml}
        ${ctaHtml}
        ${secondaryHtml}
        
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} Kobara App. Tous droits réservés.</p>
      <p style="color: #9CA3AF; font-size: 14px; margin: 8px 0 0 0;">Infrastructure de paiement pour Haïti.</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendEmailCore({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const separator = "─".repeat(56);
  console.log(`
┌${separator}┐
│ 📧 [KOBARA EMAIL LOG]                                  │
│                                                        │
│ Destinataire : ${to.padEnd(39)} │
│ Sujet        : ${subject.padEnd(39)} │
└${separator}┘
  `);

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Kobara <noreply@kobara.app>',
          to: [to],
          subject: subject,
          html: html,
          text: text
        })
      });
      if (!res.ok) {
        console.error(`[RESEND ERROR] Échec de l'envoi à ${to} :`, await res.text());
      }
    } catch (error) {
      console.error(`[RESEND ERROR] Exception lors de l'envoi à ${to} :`, error);
    }
  } else {
    console.log(`[INFO] Clé RESEND_API_KEY manquante. L'e-mail a été généré en mode développement.`);
  }

  return { success: true };
}

// ------------------------------------------------------------------
// TEMPLATES PRÊTS À L'EMPLOI
// ------------------------------------------------------------------

export async function sendWelcomeEmail({ to, verificationLink }: { to: string; verificationLink: string }) {
  const subject = "Activez votre compte Kobara";
  const text = `Bonjour,\n\nMerci de vous être inscrit sur Kobara. Pour activer votre compte marchand et commencer à accepter des paiements MonCash, veuillez cliquer sur ce lien : ${verificationLink}\n\nCe lien est valide pendant 24 heures.`;
  
  const html = renderEmailTemplate({
    subject,
    greeting: "Bienvenue sur Kobara !",
    paragraphs: [
      "Merci d'avoir choisi Kobara comme infrastructure de paiement pour votre entreprise.",
      "Pour activer votre compte marchand et commencer à générer des liens de paiement MonCash, vous devez d'abord vérifier votre adresse e-mail."
    ],
    cta: {
      text: "Activer mon compte",
      url: verificationLink
    },
    secondaryInfo: [
      { label: "Validité", value: "Ce lien expire dans 24 heures." }
    ]
  });

  return sendEmailCore({ to, subject, html, text });
}

export async function sendPasswordResetEmail({ to, resetLink }: { to: string; resetLink: string }) {
  const subject = "Réinitialisation de votre mot de passe Kobara";
  const text = `Vous avez demandé la réinitialisation de votre mot de passe Kobara. Cliquez sur ce lien : ${resetLink}`;
  
  const html = renderEmailTemplate({
    subject,
    greeting: "Bonjour,",
    paragraphs: [
      "Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Kobara.",
      "Si vous êtes à l'origine de cette demande, veuillez cliquer sur le bouton ci-dessous pour créer un nouveau mot de passe."
    ],
    cta: {
      text: "Réinitialiser mon mot de passe",
      url: resetLink
    },
    secondaryInfo: [
      { label: "Validité", value: "Ce lien expire dans 1 heure." },
      { label: "Sécurité", value: "Si vous n'avez pas fait cette demande, ignorez cet e-mail." }
    ],
    alertType: 'warning'
  });

  return sendEmailCore({ to, subject, html, text });
}

export async function sendSecurityAlertEmail({ to, title, message, ipAddress, time }: { to: string; title: string; message: string; ipAddress?: string; time?: string }) {
  const subject = `Alerte de sécurité: ${title}`;
  const text = `Alerte Kobara: ${message}\nIP: ${ipAddress}\nHeure: ${time}`;
  
  const html = renderEmailTemplate({
    subject: title,
    paragraphs: [message],
    secondaryInfo: [
      { label: "Adresse IP", value: ipAddress || "Inconnue" },
      { label: "Date & Heure", value: time || new Date().toLocaleString() }
    ],
    alertType: 'critical'
  });

  return sendEmailCore({ to, subject, html, text });
}

// Fonction générique (pour la rétrocompatibilité)
export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text: string }) {
  const generatedHtml = html || renderEmailTemplate({
    subject,
    paragraphs: text.split('\n\n').filter(p => p.trim() !== '')
  });
  return sendEmailCore({ to, subject, html: generatedHtml, text });
}
