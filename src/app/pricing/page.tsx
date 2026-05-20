import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingBackground } from "@/components/landing/FloatingBackground";
import { Check, Zap, ArrowRight } from "lucide-react";
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
    <main className="relative min-h-screen">
      <FloatingBackground />
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-40 pb-16 relative text-center">
        <div className="max-w-[860px] mx-auto px-5 sm:px-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-sm font-bold text-kobara-red mb-6">
            {language === "fr" ? "Tarification transparente" : "Transparent pricing"}
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-kobara-primary tracking-tighter leading-[1.05] mb-5">
            {language === "fr" ? "Le bon plan pour" : "The right plan for"}<br />
            <span className="text-kobara-red">{language === "fr" ? "chaque étape." : "every stage."}</span>
          </h1>
          <p className="text-lg text-kobara-secondary font-medium leading-relaxed max-w-xl mx-auto">
            {language === "fr" 
              ? "Commencez gratuitement. Scalez quand vous êtes prêt. Aucun frais caché, jamais."
              : "Get started for free. Scale when you are ready. No hidden fees, ever."}
          </p>
        </div>
      </section>

      {/* ── Plans grid ── */}
      <section className="pb-24 relative">
        <div className="max-w-[1340px] mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[28px] overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                  ${plan.highlight
                    ? "bg-kobara-primary border-kobara-primary shadow-2xl shadow-kobara-primary/20 ring-2 ring-kobara-red/40"
                    : "bg-white/65 backdrop-blur-md border-white/90 shadow-lg"
                  }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-5 right-5">
                    <span className={`text-xs font-black px-3 py-1 rounded-full
                      ${plan.highlight
                        ? "bg-kobara-red text-white"
                        : "bg-kobara-primary text-white"
                      }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Plan name */}
                  <div className={`text-xs font-black uppercase tracking-widest mb-3 ${plan.highlight ? "text-white/60" : "text-kobara-secondary"}`}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className={`text-[3.2rem] font-black leading-none tracking-tighter ${plan.highlight ? "text-white" : "text-kobara-primary"}`}>
                      {plan.priceLabel}
                      {plan.period && (
                        <span className={`text-base font-semibold ml-1 ${plan.highlight ? "text-white/60" : "text-kobara-secondary"}`}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm font-medium leading-relaxed mb-6 ${plan.highlight ? "text-white/70" : "text-kobara-secondary"}`}>
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={plan.ctaHref}
                    className={`w-full h-12 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 mb-7 transition-all active:scale-95
                      ${plan.highlight
                        ? "bg-kobara-red hover:bg-rose-600 text-white shadow-lg shadow-kobara-red/30 hover:scale-105"
                        : plan.name === "Free"
                          ? "bg-slate-100 hover:bg-slate-200 text-kobara-primary"
                          : "bg-kobara-primary hover:bg-slate-900 text-white hover:scale-105"
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Divider */}
                  <div className={`border-t mb-6 ${plan.highlight ? "border-white/10" : "border-slate-100"}`} />

                  {/* Features */}
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                          ${plan.highlight ? "bg-white/10" : "bg-emerald-50"}`}>
                          <Check className={`w-3 h-3 ${plan.highlight ? "text-emerald-300" : "text-emerald-500"}`} />
                        </div>
                        <span className={`text-sm font-medium leading-snug ${plan.highlight ? "text-white/85" : "text-kobara-primary"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Fee note */}
                  {plan.feeNote && (
                    <p className="text-[11px] text-kobara-secondary font-medium mt-5 leading-relaxed">
                      {plan.feeNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-kobara-secondary font-medium">
              {language === "fr" 
                ? "Tous les plans incluent l'accès au dashboard, les notifications et l'intégration MonCash."
                : "All plans include dashboard access, notifications, and MonCash integration."}
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="py-16 relative">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-10">
          <h2 className="text-3xl font-black text-kobara-primary tracking-tighter text-center mb-10">
            {language === "fr" ? "Comparaison détaillée" : "Detailed comparison"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-5 text-sm font-black text-kobara-secondary uppercase tracking-wider">
                    {language === "fr" ? "Fonctionnalité" : "Feature"}
                  </th>
                  {["Free", "Pro", "Premium", "Business"].map((n) => (
                    <th key={n} className={`text-center py-4 px-4 text-sm font-black uppercase tracking-wider rounded-t-xl
                      ${n === "Premium" ? "bg-kobara-primary text-white" : "text-kobara-primary"}`}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
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
                  <tr key={i} className={i % 2 === 0 ? "bg-white/40" : ""}>
                    <td className="py-3.5 px-5 text-sm font-semibold text-kobara-primary rounded-l-xl">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td
                        key={j}
                        className={`py-3.5 px-4 text-sm text-center font-bold
                          ${j === 2 ? "bg-kobara-primary/5 text-kobara-primary" : "text-kobara-secondary"}
                          ${j === 3 ? "rounded-r-xl" : ""}`}
                      >
                        {val}
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
      <section className="py-20 relative">
        <div className="max-w-[760px] mx-auto px-5 sm:px-10">
          <h2 className="text-3xl font-black text-kobara-primary tracking-tighter text-center mb-10">
            {language === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md border border-white/90 rounded-2xl p-6">
                <h3 className="font-bold text-kobara-primary mb-2">{item.q}</h3>
                <p className="text-kobara-secondary font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 relative">
        <div className="max-w-[700px] mx-auto px-5 sm:px-10 text-center">
          <div className="bg-kobara-primary rounded-[32px] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kobara-red/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <Zap className="w-8 h-8 text-kobara-red mx-auto mb-5" />
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4">
                {language === "fr" ? "Prêt à accepter vos premiers paiements ?" : "Ready to accept your first payments?"}
              </h2>
              <p className="text-white/70 font-medium mb-8 leading-relaxed">
                {language === "fr" 
                  ? "Créez votre compte gratuitement et commencez à recevoir des paiements MonCash en quelques minutes."
                  : "Create your account for free and start receiving MonCash payments in minutes."}
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 h-13 px-10 rounded-xl bg-kobara-red hover:bg-rose-600 text-white font-bold text-[16px] shadow-xl shadow-kobara-red/30 transition-all hover:scale-105 active:scale-95"
              >
                {language === "fr" ? "Commencer gratuitement" : "Start for free"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
