export const riskNotifier = {
  async sendHighRiskAlert(merchantId: string, score: number, violations: any[]) {
    console.log(`[RISK ALERT] Merchant ${merchantId} crossed high risk threshold. Score: ${score}`)
    
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *High Risk Alert* 🚨\nMerchant ID: \`${merchantId}\`\nNew Score: *${score}*\nViolations: ${violations.length}`
        })
      }).catch(err => console.error("Slack webhook failed", err))
    }

    if (process.env.COMPLIANCE_EMAIL && process.env.SMTP_HOST) {
      try {
        const { sendEmail } = require('../server/mail');
        await sendEmail({
          to: process.env.COMPLIANCE_EMAIL,
          subject: `🚨 ALERTE CRITIQUE: Marchand ${merchantId.split('-')[0]} à risque (${score}/100)`,
          text: `Le marchand ${merchantId} a dépassé le seuil de risque avec un score de ${score}.\n\nNombre d'infractions détectées : ${violations.length}\n\nVeuillez vous connecter au tableau de bord d'administration pour investiguer.`,
          html: `<p>Le marchand <strong>${merchantId}</strong> a dépassé le seuil de risque avec un score de <strong>${score}</strong>.</p>
                 <p>Nombre d'infractions détectées : ${violations.length}</p>
                 <p>Veuillez vous connecter au tableau de bord d'administration pour investiguer.</p>`
        });
        console.log(`Email SMTP envoyé avec succès à ${process.env.COMPLIANCE_EMAIL}`);
      } catch (err) {
        console.error("Échec de l'envoi de l'email SMTP:", err);
      }
    }
  },

  async sendNewAIRulesReviewAlert(docVersion: string, newRulesCount: number) {
    console.log(`[AI RULES] ${newRulesCount} new rules pending review for CGU v${docVersion}`)
    
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🤖 *Nouvelles Règles IA* \n${newRulesCount} règles générées à partir des CGU v${docVersion} sont en attente de validation par la compliance.`
        })
      }).catch(err => console.error("Discord webhook failed", err))
    }
  }
}
