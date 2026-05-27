import nodemailer from 'nodemailer';

// Module d'envoi d'e-mails pour Kobara
// Supporte SMTP réel si configuré, avec un simulateur pro en console en développement

// MED-05: HTML escape function to prevent XSS via email content
function escapeHtml(str: any): string {
  if (typeof str !== 'string') {
    str = String(str || '');
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

function generatePremiumEmailHtml(subject: string, text: string) {
  const safeSubject = escapeHtml(subject);

  // Convert text into beautiful paragraphs and buttons/codes
  const contentHtml = text.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    
    // Check if paragraph is just a URL (e.g. verificationLink, resetLink)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const safeUrl = escapeHtml(trimmed);
      return '\n        <div style="text-align: center; margin: 32px 0;">\n          <a href="' + safeUrl + '" style="background-color: #E53E3E; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(229, 62, 62, 0.2);">Cliquez ici pour continuer</a>\n        </div>\n      ';
    }
    
    // Check if paragraph contains exactly a 6 digit code (like OTP)
    const codeMatch = trimmed.match(/ :\s*(\d{6})$/);
    if (codeMatch) {
      const textBefore = escapeHtml(trimmed.replace(codeMatch[0], ''));
      return '\n        <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">' +
        textBefore.replace(/\n/g, '<br>') +
        '</p>\n        <div style="text-align: center; margin: 32px 0;">\n          <span style="background-color: #F9FAFB; color: #111827; font-weight: 800; padding: 16px 32px; border-radius: 12px; display: inline-block; font-size: 28px; letter-spacing: 8px; border: 1px solid #E5E7EB;">' +
        escapeHtml(codeMatch[1]) +
        '</span>\n        </div>\n      ';
    }
    
    // MED-05: Escape all dynamic content before inserting into HTML
    return '<p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">' +
      escapeHtml(trimmed).replace(/\n/g, '<br>') +
      '</p>';
  }).join('');

  return '\n<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' +
    safeSubject +
    '</title>\n</head>\n<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">\n  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">\n    <!-- Header -->\n    <div style="text-align: center; margin-bottom: 32px;">\n      <h1 style="color: #E53E3E; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Kobara</h1>\n    </div>\n    \n    <!-- Card -->\n    <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #F3F4F6;">\n      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;">' +
    safeSubject +
    '</h2>\n      \n      ' +
    contentHtml +
    '\n      \n    </div>\n    \n    <!-- Footer -->\n    <div style="text-align: center; margin-top: 32px;">\n      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">© ' +
    new Date().getFullYear() +
    ' Kobara App. Tous droits réservés.</p>\n      <p style="color: #9CA3AF; font-size: 14px; margin: 8px 0 0 0;">Infrastructure de paiement pour Haïti.</p>\n    </div>\n  </div>\n</body>\n</html>\n  ';
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
  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const smtpPort = process.env.SMTP_PORT || process.env.MAIL_PORT;
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USERNAME;
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || process.env.MAIL_FROM_ADDRESS || 'no-reply@kobara.app';

  const generatedHtml = html || generatePremiumEmailHtml(subject, text);

  // Formatage propre pour l'affichage en console
  const separator = "─".repeat(56);
  console.log(`
┌${separator}┐
│ 📧 [KOBARA EMAIL SIMULATOR]                            │
│                                                        │
│ Destinataire : ${to.padEnd(39)} │
│ Sujet        : ${subject.padEnd(39)} │
│                                                        │
│ Message :                                              │
${text.split('\n').map(line => `│   ${line.padEnd(52)} │`).join('\n')}
│                                                        │
└${separator}┘
  `);

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: smtpPort === '465',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text,
        html: generatedHtml
      });
      console.log(`[SMTP] E-mail envoyé avec succès à ${to}`);
    } catch (error) {
      console.error(`[SMTP ERROR] Échec de l'envoi de l'e-mail à ${to} :`, error);
    }
  } else {
    console.log(`[SMTP INFO] Aucun serveur SMTP configuré. E-mail simulé avec succès en console.`);
  }

  return { success: true };
}
