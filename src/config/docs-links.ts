const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kobara.app";

export const docsLinks = {
  quickstart: `${appUrl}/docs/quickstart`,
  authentication: `${appUrl}/docs/authentication`,
  javascriptSdk: `${appUrl}/docs/sdks/javascript`,
  nodeSdk: `${appUrl}/docs/sdks/nodejs`,
  pythonSdk: `${appUrl}/docs/sdks/python`,
  phpSdk: `${appUrl}/docs/sdks/php`,
  wordpressPlugin: `${appUrl}/docs/integrations/wordpress`,
  aiIntegration: `${appUrl}/docs/integrations/ai`,
  payments: `${appUrl}/docs/api/payments`,
  paymentLinks: `${appUrl}/docs/api/payment-links`,
  webhooks: `${appUrl}/docs/api/webhooks`,
  withdrawals: `${appUrl}/docs/api/withdrawals`,
  errors: `${appUrl}/docs/api/errors`,
};
