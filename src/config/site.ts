export const siteConfig = {
  name: "Kobara",
  description: "Integrate a modern Payment Gateway into your Website, App or Business in Haiti. Accept MonCash & NatCash, create payment links, and use our developer-friendly APIs.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kobara.app",
  ogImage: "/og.jpg",
  links: {
    twitter: "https://twitter.com/kobara",
    github: "https://github.com/L09DP01/kobara-app",
  },
  keywords: [
    "Payment Gateway Haiti",
    "Passerelle de paiement Haïti",
    "MonCash API",
    "NatCash API",
    "MonCash integration",
    "NatCash integration",
    "Paiement MonCash site web",
    "Paiement NatCash site web",
    "MonCash WordPress",
    "MonCash checkout",
    "NatCash checkout",
    "MonCash Payment API",
    "Paiement en ligne Haïti",
    "API de paiement Haïti",
    "Fintech Haiti",
    "Kobara Payment Gateway"
  ]
};

export type SiteConfig = typeof siteConfig;
