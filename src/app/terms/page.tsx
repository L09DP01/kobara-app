import { getServerTranslation } from "@/lib/server/i18n";
import Link from "next/link";
import { ArrowLeft, FileText, Shield, Scale } from "lucide-react";

export async function generateMetadata() {
  const { t } = await getServerTranslation();
  return {
    title: `${t("nav.terms")} — Kobara`,
    description: "Conditions d'utilisation de la plateforme Kobara.",
  };
}

export default async function TermsPage() {
  const { language } = await getServerTranslation();

  const content = {
    fr: {
      title: "Conditions d'utilisation",
      lastUpdated: "Dernière mise à jour : 12 Juin 2026",
      intro: "Bienvenue sur Kobara. En utilisant notre infrastructure de paiement, vous acceptez les conditions suivantes conçues pour garantir un écosystème sûr, fiable et conforme à la réglementation haïtienne.",
      sections: [
        {
          id: "account",
          title: "1. Création de compte et Éligibilité",
          text: "Pour ouvrir un compte marchand Kobara, vous devez être une entreprise enregistrée en Haïti ou un travailleur indépendant autorisé. Vous garantissez que toutes les informations fournies lors de l'inscription (KYC) sont exactes. Kobara se réserve le droit de suspendre tout compte présentant des informations frauduleuses.",
        },
        {
          id: "payments",
          title: "2. Traitement des paiements MonCash",
          text: "Kobara agit en tant que passerelle technologique facilitant les paiements via le réseau MonCash. Nous ne sommes pas une banque. Les fonds collectés sont soumis à des frais de traitement fixes (ex: 2.9%). Les transactions peuvent être bloquées par nos algorithmes si une activité suspecte est détectée (lutte anti-fraude).",
        },
        {
          id: "withdrawals",
          title: "3. Retraits et Transferts de Solde",
          text: "Les retraits depuis votre solde Kobara vers votre compte MonCash ou compte bancaire sont soumis à des vérifications de sécurité. Kobara s'engage à traiter ces demandes dans un délai raisonnable. En cas de litige, les fonds peuvent être gelés temporairement.",
        },
        {
          id: "security",
          title: "4. Sécurité et API",
          text: "Vous êtes responsable de la sécurité de vos clés API et de l'accès à votre compte (MFA recommandé). Kobara ne sera pas tenu responsable de toute perte financière résultant d'une compromission de vos identifiants due à une négligence de votre part.",
        }
      ]
    },
    en: {
      title: "Terms of Service",
      lastUpdated: "Last updated: June 12, 2026",
      intro: "Welcome to Kobara. By using our payment infrastructure, you agree to the following terms designed to ensure a safe, reliable ecosystem compliant with Haitian regulations.",
      sections: [
        {
          id: "account",
          title: "1. Account Creation and Eligibility",
          text: "To open a Kobara merchant account, you must be a registered business in Haiti or an authorized freelancer. You guarantee that all information provided during registration (KYC) is accurate. Kobara reserves the right to suspend any account with fraudulent information.",
        },
        {
          id: "payments",
          title: "2. MonCash Payment Processing",
          text: "Kobara acts as a technology gateway facilitating payments via the MonCash network. We are not a bank. Collected funds are subject to fixed processing fees (e.g., 2.9%). Transactions may be blocked by our algorithms if suspicious activity is detected (anti-fraud).",
        },
        {
          id: "withdrawals",
          title: "3. Withdrawals and Balance Transfers",
          text: "Withdrawals from your Kobara balance to your MonCash or bank account are subject to security checks. Kobara commits to processing these requests within a reasonable timeframe. In the event of a dispute, funds may be temporarily frozen.",
        },
        {
          id: "security",
          title: "4. Security and API",
          text: "You are responsible for the security of your API keys and account access (MFA recommended). Kobara will not be held liable for any financial loss resulting from a compromise of your credentials due to your negligence.",
        }
      ]
    },
    ht: {
      title: "Kondisyon Itilizasyon",
      lastUpdated: "Dènye mizajou: 12 Jen 2026",
      intro: "Byenvini sou Kobara. Lè w sèvi ak platfòm peman nou an, ou aksepte kondisyon sa yo ki fèt pou garanti yon sistèm ki an sekirite, fyab, epi ki respekte lwa peyi Dayiti.",
      sections: [
        {
          id: "account",
          title: "1. Kreyasyon Kont ak Elijibilite",
          text: "Pou w louvri yon kont machann Kobara, fòk ou se yon biznis ki anrejistre legalman an Ayiti oswa yon travayè endepandan ki otorize. Ou garanti tout enfòmasyon ou bay lè w ap anrejistre (KYC) yo kòrèk. Kobara rezève dwa pou l bloke nenpòt kont ki gen fo enfòmasyon.",
        },
        {
          id: "payments",
          title: "2. Pwosesis Peman MonCash",
          text: "Kobara se yon pon teknolojik ki fasilite peman sou rezo MonCash la. Nou pa yon bank. Gen frè fiks k ap aplike sou lajan ou resevwa yo (egzanp: 2.9%). Sistèm nou an ka bloke tranzaksyon si li wè gen aktivite sispèk (anti-fwod).",
        },
        {
          id: "withdrawals",
          title: "3. Retrè ak Transfè Lajan",
          text: "Retrè ki fèt sot nan balans Kobara w pou al sou kont MonCash oswa kont bank ou oblije pase nan verifikasyon sekirite. Kobara pran angajman pou l trete demann sa yo nan yon tan ki rezonab. Si ta gen yon pwoblèm oswa yon kontestasyon, nou ka bloke lajan an pou yon ti tan.",
        },
        {
          id: "security",
          title: "4. Sekirite ak API",
          text: "Se ou menm ki responsab pou sekirite kle API w yo ak aksè nan kont ou (nou konseye w itilize MFA). Kobara p ap responsab pou okenn pèt finansye si w kite yon moun vòlè enfòmasyon w yo poutèt ou pa t fè atansyon.",
        }
      ]
    }
  };

  const currentData = content[language];

  return (
    <div className="min-h-screen bg-[#020B14] text-[#AAB3C2] selection:bg-[#FF4A1C]/30 selection:text-white">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1E2A38]/30 to-transparent pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FF4A1C]/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Sidebar Navigation */}
        <div className="md:w-1/4 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#FF4A1C] transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          
          <div className="sticky top-24">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Navigation Légale</h3>
            <nav className="space-y-2">
              <Link href="/terms" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07111F] border border-[#1E2A38] text-white font-bold transition-colors">
                <Scale className="w-4 h-4 text-[#FF4A1C]" />
                {language === "en" ? "Terms of Service" : language === "ht" ? "Kondisyon" : "Conditions d'utilisation"}
              </Link>
              <Link href="/privacy" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-[#AAB3C2] hover:bg-[#07111F] hover:border-[#1E2A38] hover:text-white font-medium transition-colors">
                <Shield className="w-4 h-4" />
                {language === "en" ? "Privacy Policy" : language === "ht" ? "Konfidansyalite" : "Politique de confidentialité"}
              </Link>
            </nav>
            
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-b from-[#07111F] to-[#020B14] border border-[#1E2A38]">
              <FileText className="w-8 h-8 text-[#FF4A1C] mb-4" />
              <h4 className="text-white font-bold mb-2">Besoin d'aide légale ?</h4>
              <p className="text-xs text-[#AAB3C2] leading-relaxed mb-4">Notre équipe de conformité est disponible pour répondre à vos questions sur ces conditions.</p>
              <Link href="/contact" className="text-xs font-bold text-[#FF4A1C] hover:text-white transition-colors">Contactez-nous &rarr;</Link>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:w-3/4 max-w-3xl">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2A38]/30 border border-[#1E2A38] text-xs font-bold text-white mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF4A1C] animate-pulse"></span>
              {currentData.lastUpdated}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
              {currentData.title}
            </h1>
            <p className="text-lg text-[#AAB3C2] leading-relaxed">
              {currentData.intro}
            </p>
          </header>

          <div className="space-y-16">
            {currentData.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                  {section.title}
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1E2A38] to-transparent"></div>
                </h2>
                <div className="prose prose-invert prose-p:text-[#AAB3C2] prose-p:leading-loose prose-p:text-[15px] prose-a:text-[#FF4A1C] max-w-none">
                  <p>{section.text}</p>
                </div>
              </section>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
