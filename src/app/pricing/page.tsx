import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingBackground } from "@/components/landing/FloatingBackground";
import { Check, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getServerTranslation } from "@/lib/server/i18n";

export async function generateMetadata() {
  const { t } = await getServerTranslation();
  return {
    title: `${t("nav.pricing")} — Kobara`,
    description: "Plans simples et transparents pour chaque étape de votre croissance. Commencez gratuitement. / Simple and transparent plans for every stage of your growth. Start for free.",
  };
}

export default async function PricingPage() {
  const { t, language } = await getServerTranslation();

  const plans = [
    {
      name: "Free",
      price: null,
      priceLabel: language === "fr" ? "Gratuit" : "Free",
      period: null,
      description: language === "fr" ? "Parfait pour tester et lancer votre premier projet." : "Perfect for testing and launching your first project.",
      highlight: false,
      badge: null,
      features: language === "fr" ? [
        "1 clé API",
        "Plugin WordPress inclus",
        "10 paiements / mois",
        "4% de frais par transaction*",
        "Retrait jusqu'à 2 500 HTG / jour",
        "Dashboard de base",
        "Support communauté",
      ] : [
        "1 API key",
        "WordPress plugin included",
        "10 payments / month",
        "4% fee per transaction*",
        "Withdrawal up to 2,500 HTG / day",
        "Basic Dashboard",
        "Community support",
      ],
      cta: language === "fr" ? "Commencer gratuitement" : "Start for free",
      ctaHref: "/register",
      feeNote: language === "fr" ? "* Inclut les frais Kobara + frais de traitement MonCash" : "* Includes Kobara fees + MonCash processing fees",
    },
    {
      name: "Pro",
      price: 1750,
      priceLabel: "1 750",
      period: language === "fr" ? "HTG / mois" : "HTG / month",
      description: language === "fr" ? "Pour les marchands qui grandissent et ont besoin de plus de volume." : "For growing merchants who need more volume.",
      highlight: false,
      badge: null,
      features: language === "fr" ? [
        "Clés API illimitées",
        "Plugin WordPress inclus",
        "Paiements illimités",
        "2.9% de frais par transaction",
        "Retrait jusqu'à 10 000 HTG / jour",
        "Webhooks avancés",
        "Support par email prioritaire",
      ] : [
        "Unlimited API keys",
        "WordPress plugin included",
        "Unlimited payments",
        "2.9% fee per transaction",
        "Withdrawal up to 10,000 HTG / day",
        "Advanced webhooks",
        "Priority email support",
      ],
      cta: language === "fr" ? "Démarrer avec Pro" : "Get started with Pro",
      ctaHref: "/register?plan=pro",
      feeNote: null,
    },
    {
      name: "Premium",
      price: 5000,
      priceLabel: "5 000",
      period: language === "fr" ? "HTG / mois" : "HTG / month",
      description: language === "fr" ? "Pour les entreprises établies avec des volumes de paiement élevés." : "For established businesses with high payment volumes.",
      highlight: true,
      badge: language === "fr" ? "Populaire" : "Popular",
      features: language === "fr" ? [
        "Clés API illimitées",
        "Plugin WordPress inclus",
        "Paiements illimités",
        "2.9% de frais par transaction",
        "Retrait jusqu'à 20 000 HTG / jour",
        "Webhooks + Logs avancés",
        "Analytics & rapports",
        "Support prioritaire (email + chat)",
      ] : [
        "Unlimited API keys",
        "WordPress plugin included",
        "Unlimited payments",
        "2.9% fee per transaction",
        "Withdrawal up to 20,000 HTG / day",
        "Webhooks & advanced logs",
        "Analytics & reports",
        "Priority support (email + chat)",
      ],
      cta: language === "fr" ? "Démarrer avec Premium" : "Get started with Premium",
      ctaHref: "/register?plan=premium",
      feeNote: null,
    },
    {
      name: "Business",
      price: 12500,
      priceLabel: "12 500",
      period: language === "fr" ? "HTG / mois" : "HTG / month",
      description: language === "fr" ? "Solution complète pour les grandes entreprises sans limites." : "Complete solution for large enterprises without limits.",
      highlight: false,
      badge: language === "fr" ? "Entreprise" : "Enterprise",
      features: language === "fr" ? [
        "Tout ce qui est inclus dans Premium",
        "Clés API illimitées",
        "Plugin WordPress inclus",
        "Paiements illimités",
        "2.9% de frais par transaction",
        "Retraits illimités",
        "Intégration personnalisée",
        "SLA garanti 99.9%",
        "Gestionnaire de compte dédié",
        "Support 24/7 prioritaire",
      ] : [
        "Everything included in Premium",
        "Unlimited API keys",
        "WordPress plugin included",
        "Unlimited payments",
        "2.9% fee per transaction",
        "Unlimited withdrawals",
        "Custom integration",
        "99.9% guaranteed SLA",
        "Dedicated account manager",
        "24/7 priority support",
      ],
      cta: language === "fr" ? "Contacter l'équipe" : "Contact sales",
      ctaHref: "/contact",
      feeNote: null,
    },
  ];

  const faqItems = [
    {
      q: language === "fr" ? "Comment fonctionnent les frais de transaction ?" : "How do transaction fees work?",
      a: language === "fr" 
        ? "Les frais sont automatiquement déduits de chaque paiement reçu. Par exemple, avec le plan Free (4%) : pour 1 000 HTG reçus, vous recevez 960 HTG. Avec les plans payants (2.9%) : pour 1 000 HTG, vous recevez 971 HTG."
        : "Fees are automatically deducted from each payment received. For example, with the Free plan (4%): for 1,000 HTG received, you receive 960 HTG. With the paid plans (2.9%): for 1,000 HTG received, you receive 971 HTG.",
    },
    {
      q: language === "fr" ? "Que représentent les 4% du plan Free ?" : "What do the 4% of the Free plan represent?",
      a: language === "fr"
        ? "Les 4% du plan Free incluent les frais de la plateforme Kobara ainsi que les frais d'infrastructure de traitement MonCash. Les plans payants bénéficient d'un taux réduit à 2.9%."
        : "The 4% fee on the Free plan includes Kobara platform fees as well as MonCash processing infrastructure fees. Paid plans benefit from a reduced transaction rate of 2.9%.",
    },
    {
      q: language === "fr" ? "Quand puis-je recevoir mes fonds ?" : "When can I receive my funds?",
      a: language === "fr"
        ? "Votre solde est mis à jour immédiatement après chaque paiement confirmé. Vous pouvez demander un retrait à tout moment, dans la limite journalière de votre plan."
        : "Your balance is updated immediately after each confirmed payment. You can request a withdrawal at any time, up to your plan's daily withdrawal limit.",
    },
    {
      q: language === "fr" ? "Puis-je changer de plan à tout moment ?" : "Can I change my plan at any time?",
      a: language === "fr"
        ? "Oui. Vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre dashboard. Le changement prend effet immédiatement."
        : "Yes. You can upgrade or downgrade your plan at any time from your dashboard. The change takes effect immediately.",
    },
    {
      q: language === "fr" ? "Y a-t-il des frais cachés ?" : "Are there any hidden fees?",
      a: language === "fr"
        ? "Non. Le prix affiché est le seul coût mensuel. Les seuls frais supplémentaires sont les 2.9% (ou 4% pour Free) sur chaque transaction."
        : "No. The price displayed is the only monthly cost. The only other fees are the 2.9% (or 4% for Free) transaction fees on each transaction.",
    },
  ];

  return (
    <main className="relative min-h-[100dvh] bg-[#020B14] selection:bg-[#FF4A1C] selection:text-white font-sans text-white">
      <FloatingBackground />
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-40 pb-16 relative text-center">
        <div className="max-w-[860px] mx-auto px-5 sm:px-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FF4A1C]/10 border border-[#FF4A1C]/20 text-sm font-bold text-[#FF4A1C] mb-6 shadow-[0_0_15px_rgba(255,74,28,0.2)]">
            {language === "fr" ? "Tarification transparente" : "Transparent pricing"}
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-5">
            {language === "fr" ? "Le bon plan pour" : "The right plan for"}<br />
            <span className="text-[#FF4A1C]">{language === "fr" ? "chaque étape." : "every stage."}</span>
          </h1>
          <p className="text-lg text-[#AAB3C2] font-medium leading-relaxed max-w-xl mx-auto">
            {language === "fr" 
              ? "Commencez gratuitement. Scalez quand vous êtes prêt. Aucun frais caché, jamais."
              : "Get started for free. Scale when you are ready. No hidden fees, ever."}
          </p>
        </div>
      </section>

      {/* ── Plans grid ── */}
      <section className="pb-24 relative">
        <div className="max-w-[1340px] mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[28px] overflow-hidden border transition-all duration-300 hover:-translate-y-2 group
                  ${plan.highlight
                    ? "bg-[#07111F] border-[#FF4A1C]/50 shadow-[0_10px_40px_rgba(255,74,28,0.2)]"
                    : "bg-[#07111F] border-[#1E2A38] hover:border-[#AAB3C2]/30 shadow-lg"
                  }`}
              >
                {/* Highlight Glow inside card */}
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#FF4A1C] to-transparent opacity-80" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-5 right-5 z-10">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FF4A1C]/10 border border-[#FF4A1C]/20 text-[#FF4A1C] shadow-[0_0_10px_rgba(255,74,28,0.2)]">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1 relative z-10">
                  {/* Plan name */}
                  <div className={`text-sm font-bold uppercase tracking-widest mb-3 ${plan.highlight ? "text-[#FF4A1C]" : "text-[#AAB3C2]"}`}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-[3.5rem] font-black leading-none tracking-tighter text-white">
                      {plan.priceLabel}
                      {plan.period && (
                        <span className="text-base font-semibold ml-2 text-[#AAB3C2] tracking-normal">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-medium leading-relaxed mb-8 text-[#AAB3C2] min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={plan.ctaHref}
                    className={`w-full h-13 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 mb-8 transition-all
                      ${plan.highlight
                        ? "bg-[#FF4A1C] hover:bg-[#FF2E14] text-white shadow-[0_0_20px_rgba(255,74,28,0.3)] hover:shadow-[0_0_30px_rgba(255,74,28,0.5)] active:scale-95"
                        : "bg-[#020B14] border border-[#1E2A38] hover:border-[#AAB3C2] text-white active:scale-95"
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-[#1E2A38] mb-8" />

                  {/* Features */}
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlight ? "text-[#FF4A1C]" : "text-[#AAB3C2]"}`} />
                        <span className="text-sm font-medium leading-snug text-[#AAB3C2]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Fee note */}
                  {plan.feeNote && (
                    <p className="text-[12px] text-[#AAB3C2]/70 font-medium mt-6 leading-relaxed">
                      {plan.feeNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison note */}
          <div className="mt-12 text-center">
            <p className="text-[#AAB3C2] font-medium">
              {language === "fr" 
                ? "Tous les plans incluent l'accès au dashboard, les notifications et l'intégration MonCash."
                : "All plans include dashboard access, notifications, and MonCash integration."}
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="py-24 relative">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-10">
          <h2 className="text-4xl font-black text-white tracking-tighter text-center mb-12">
            {language === "fr" ? "Comparaison détaillée" : "Detailed comparison"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-6 px-6 text-sm font-bold text-[#AAB3C2] uppercase tracking-wider border-b border-[#1E2A38]">
                    {language === "fr" ? "Fonctionnalité" : "Feature"}
                  </th>
                  {["Free", "Pro", "Premium", "Business"].map((n) => (
                    <th key={n} className={`text-center py-6 px-4 text-sm font-bold uppercase tracking-wider border-b border-[#1E2A38]
                      ${n === "Premium" ? "text-[#FF4A1C]" : "text-white"}`}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2A38]">
                {[
                  { 
                    label: language === "fr" ? "Prix mensuel" : "Monthly price",          
                    values: [
                      language === "fr" ? "Gratuit" : "Free", 
                      "1 750 HTG", 
                      "5 000 HTG", 
                      "12 500 HTG"
                    ] 
                  },
                  { 
                    label: language === "fr" ? "Frais par transaction" : "Transaction fees", 
                    values: ["4%", "2.9%", "2.9%", "2.9%"] 
                  },
                  { 
                    label: language === "fr" ? "Clés API" : "API keys",              
                    values: ["1", "∞", "∞", "∞"] 
                  },
                  { 
                    label: language === "fr" ? "Paiements / mois" : "Payments / month",      
                    values: ["10", "∞", "∞", "∞"] 
                  },
                  { 
                    label: language === "fr" ? "Retrait journalier" : "Daily withdrawal limit",    
                    values: [
                      "2 500 HTG", 
                      "10 000 HTG", 
                      "20 000 HTG", 
                      language === "fr" ? "Illimité" : "Unlimited"
                    ] 
                  },
                  { 
                    label: language === "fr" ? "Plugin WordPress" : "WordPress plugin",      
                    values: ["✓", "✓", "✓", "✓"] 
                  },
                  { 
                    label: "Webhooks",              
                    values: ["—", "✓", "✓", "✓"] 
                  },
                  { 
                    label: language === "fr" ? "Analytics avancés" : "Advanced analytics",     
                    values: ["—", "—", "✓", "✓"] 
                  },
                  { 
                    label: language === "fr" ? "Support dédié" : "Dedicated support",         
                    values: [
                      "—", 
                      "Email", 
                      language === "fr" ? "Email + Chat" : "Email + Chat", 
                      "24/7"
                    ] 
                  },
                  { 
                    label: "SLA 99.9%",             
                    values: ["—", "—", "—", "✓"] 
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#07111F]/50 transition-colors">
                    <td className="py-5 px-6 text-sm font-semibold text-white">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td
                        key={j}
                        className={`py-5 px-4 text-sm text-center font-medium
                          ${j === 2 ? "text-[#FF4A1C]" : "text-[#AAB3C2]"}
                          ${val === "✓" ? "text-[#FF4A1C]" : ""}`}
                      >
                        {val === "✓" ? <Check className="w-5 h-5 mx-auto text-[#FF4A1C]" /> : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 relative bg-[#07111F] border-y border-[#1E2A38]">
        <div className="max-w-[800px] mx-auto px-5 sm:px-10">
          <h2 className="text-4xl font-black text-white tracking-tighter text-center mb-12">
            {language === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
          </h2>
          <div className="space-y-6">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-[#020B14] border border-[#1E2A38] rounded-2xl p-8 hover:border-[#AAB3C2]/30 transition-colors">
                <h3 className="font-bold text-lg text-white mb-3 flex items-start gap-4">
                  <span className="text-[#FF4A1C] mt-0.5">Q.</span>
                  {item.q}
                </h3>
                <p className="text-[#AAB3C2] font-medium leading-relaxed pl-8">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-[900px] mx-auto px-5 sm:px-10 text-center relative z-10">
          <div className="bg-[#07111F] rounded-[40px] p-12 md:p-20 relative overflow-hidden border border-[#1E2A38] shadow-2xl">
            {/* Animated Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4A1C]/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#020B14] border border-[#1E2A38] flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Zap className="w-8 h-8 text-[#FF4A1C]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
                {language === "fr" ? "Prêt à accepter vos premiers paiements ?" : "Ready to accept your first payments?"}
              </h2>
              <p className="text-xl text-[#AAB3C2] font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
                {language === "fr" 
                  ? "Créez votre compte gratuitement et commencez à recevoir des paiements MonCash en quelques minutes."
                  : "Create your account for free and start receiving MonCash payments in minutes."}
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 h-14 px-10 rounded-full bg-[#FF4A1C] hover:bg-[#FF2E14] text-white font-bold text-lg shadow-[0_0_20px_rgba(255,74,28,0.3)] hover:shadow-[0_0_30px_rgba(255,74,28,0.5)] transition-all hover:scale-105 active:scale-95"
              >
                {language === "fr" ? "Commencer gratuitement" : "Start for free"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
