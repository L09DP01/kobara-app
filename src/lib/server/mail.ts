// Module d'envoi d'e-mails pour Kobara
// Supporte SMTP réel si configuré, avec un simulateur pro en console en développement

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
      // Dynamic import to avoid build errors if nodemailer is not present
      const nodemailer = require('nodemailer');
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
        html: html || text.replace(/\n/g, '<br>')
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
