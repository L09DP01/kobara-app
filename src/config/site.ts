export const siteConfig = {
  name: "Kobara",
  description: "Integrate MonCash Payments Into Your Website, App Or Business in Haiti. Create payment links, use APIs, and manage transactions with our Fintech SaaS.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kobara.app",
  ogImage: "/og.jpg",
  links: {
    twitter: "https://twitter.com/kobara",
    github: "https://github.com/L09DP01/kobara-app",
  },
  keywords: [
    "MonCash API",
    "MonCash integration",
    "Paiement MonCash site web",
    "MonCash WordPress",
    "MonCash checkout",
    "Payment gateway Haiti",
    "Fintech Haiti",
    "MonCash Payment API"
  ]
};

export type SiteConfig = typeof siteConfig;
