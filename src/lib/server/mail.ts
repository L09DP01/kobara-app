// Module d'envoi d'e-mails pour Kobara utilisant Resend
// Fonctionne de manière native sur les environnements Edge et Serverless comme Vercel

function generatePremiumEmailHtml(subject: string, text: string) {
  // Convert text into beautiful paragraphs and buttons/codes
  const contentHtml = text.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    
    // Check if paragraph is just a URL (e.g. verificationLink, resetLink)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${trimmed}" style="background-color: #E53E3E; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(229, 62, 62, 0.2);">Cliquez ici pour continuer</a>
        </div>
      `;
    }
    
    // Check if paragraph contains exactly a 6 digit code (like OTP)
    const codeMatch = trimmed.match(/ :\s*(\d{6})$/);
    if (codeMatch) {
      const textBefore = trimmed.replace(codeMatch[0], '');
      return `
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${textBefore.replace(/\n/g, '<br>')}</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="background-color: #F9FAFB; color: #111827; font-weight: 800; padding: 16px 32px; border-radius: 12px; display: inline-block; font-size: 28px; letter-spacing: 8px; border: 1px solid #E5E7EB;">${codeMatch[1]}</span>
        </div>
      `;
    }
    
    return `<p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #E53E3E; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Kobara</h1>
    </div>
    
    <!-- Card -->
    <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #F3F4F6;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;">${subject}</h2>
      
      ${contentHtml}
      
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

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html?: string;
  text: string;
}) {
  const generatedHtml = html || generatePremiumEmailHtml(subject, text);

  // Formatage propre pour l'affichage en console (mode dev)
  const separator = "─".repeat(56);
  console.log(`
┌${separator}┐
│ 📧 [KOBARA EMAIL LOG]                                  │
│                                                        │
│ Destinataire : ${to.padEnd(39)} │
│ Sujet        : ${subject.padEnd(39)} │
│                                                        │
│ Message :                                              │
${text.split('\n').map(line => `│   ${line.padEnd(52)} │`).join('\n')}
│                                                        │
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
          html: generatedHtml,
          text: text
        })
      });
      if (!res.ok) {
        const errData = await res.text();
        console.error(`[RESEND ERROR] Échec de l'envoi à ${to} :`, errData);
      } else {
        console.log(`[RESEND] E-mail envoyé avec succès à ${to}`);
      }
    } catch (error) {
      console.error(`[RESEND ERROR] Exception lors de l'envoi à ${to} :`, error);
    }
  } else {
    console.log(`[INFO] Clé RESEND_API_KEY manquante. L'e-mail a été généré mais n'a pas été envoyé réellement.`);
  }

  return { success: true };
}
