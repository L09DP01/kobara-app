import { getServerTranslation } from "@/lib/server/i18n";
import Link from "next/link";
import { ArrowLeft, FileText, Shield, Scale, Lock } from "lucide-react";

export async function generateMetadata() {
  const { t } = await getServerTranslation();
  return {
    title: `${t("nav.privacy")} — Kobara`,
    description: "Politique de confidentialité des données de la plateforme Kobara.",
  };
}

export default async function PrivacyPage() {
  const { language } = await getServerTranslation();

  const content = {
    fr: {
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : 12 Juin 2026",
      intro: "Chez Kobara, la sécurité de vos données et celles de vos clients est notre priorité absolue. Ce document explique comment nous collectons, chiffrons et protégeons vos informations lors des transactions MonCash.",
      sections: [
        {
          id: "data-collection",
          title: "1. Collecte des Données",
          text: "Nous collectons les données strictement nécessaires au fonctionnement de nos services de paiement : nom de l'entreprise, coordonnées de contact, logs d'adresses IP pour la sécurité, et les métadonnées de transaction MonCash (références, numéros partiellement masqués, montants).",
        },
        {
          id: "encryption",
          title: "2. Chiffrement et Sécurité",
          text: "Toutes les communications entre votre infrastructure et l'API Kobara sont sécurisées via TLS 1.3. Les données sensibles, y compris les jetons d'API (API Tokens) et les secrets de Webhooks, sont hachés cryptographiquement en base de données. Même l'équipe Kobara n'y a pas accès en clair.",
        },
        {
          id: "sharing",
          title: "3. Partage avec des tiers (MonCash)",
          text: "Pour exécuter les paiements, certaines informations transactionnelles doivent être transmises de manière sécurisée aux serveurs de la Digicel (MonCash). Nous ne vendons, ne louons, ni ne partageons vos données à des fins publicitaires avec aucun partenaire tiers externe.",
        },
        {
          id: "rights",
          title: "4. Vos Droits d'Accès",
          text: "Conformément aux standards de confidentialité de l'industrie, vous pouvez demander à tout moment une copie des données que nous détenons sur votre compte, ou exiger la suppression définitive de votre compte marchand en contactant notre équipe de conformité.",
        }
      ]
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: June 12, 2026",
      intro: "At Kobara, the security of your data and your customers' data is our absolute priority. This document explains how we collect, encrypt, and protect your information during MonCash transactions.",
      sections: [
        {
          id: "data-collection",
          title: "1. Data Collection",
          text: "We collect only the data strictly necessary for our payment services: business name, contact details, IP address logs for security, and MonCash transaction metadata (references, partially masked phone numbers, amounts).",
        },
        {
          id: "encryption",
          title: "2. Encryption and Security",
          text: "All communications between your infrastructure and the Kobara API are secured via TLS 1.3. Sensitive data, including API Tokens and Webhook secrets, are cryptographically hashed in our database. Even the Kobara team cannot access them in plain text.",
        },
        {
          id: "sharing",
          title: "3. Sharing with Third Parties (MonCash)",
          text: "To process payments, certain transactional information must be securely transmitted to Digicel's servers (MonCash). We do not sell, rent, or share your data for advertising purposes with any external third-party partners.",
        },
        {
          id: "rights",
          title: "4. Your Access Rights",
          text: "In accordance with industry privacy standards, you can request a copy of the data we hold on your account at any time, or demand the permanent deletion of your merchant account by contacting our compliance team.",
        }
      ]
    },
    ht: {
      title: "Politik Konfidansyalite",
      lastUpdated: "Dènye mizajou: 12 Jen 2026",
      intro: "Nan Kobara, sekirite done ou yo ansanm ak done kliyan ou yo se priyorite nimewo youn nou. Dokiman sa a eksplike kijan nou ranmase, chifre, epi pwoteje enfòmasyon w yo pandan tranzaksyon MonCash yo.",
      sections: [
        {
          id: "data-collection",
          title: "1. Koleksyon Done yo",
          text: "Nou sèlman pran done ki vrèman nesesè pou sistèm peman an ka fonksyone byen: non biznis la, enfòmasyon pou kontak, adrès IP pou sekirite, ak enfòmasyon sou tranzaksyon MonCash yo (referans, nimewo ki kache an pati, ak kantite lajan yo).",
        },
        {
          id: "encryption",
          title: "2. Chifreman ak Sekirite",
          text: "Tout kominikasyon ki fèt ant sistèm ou a ak API Kobara a fèt an sekirite nan TLS 1.3. Done ki pi sansib yo, tankou Jeton API yo (API Tokens) ak sekrè Webhook yo, se kache nou kache yo (hashed) nan baz done nou an. Menm ekip Kobara a pa ka wè yo byen klè.",
        },
        {
          id: "sharing",
          title: "3. Pataje ak Lòt Konpayi (MonCash)",
          text: "Pou peman yo ka pase, gen kèk enfòmasyon ki dwe al jwenn sèvè Digicel yo (MonCash) an sekirite. Nou pa vann, nou pa lwe, epi nou pa pataje done w yo pou zafè piblisite ak okenn lòt patnè deyò.",
        },
        {
          id: "rights",
          title: "4. Dwa Aksè Ou Genyen",
          text: "Dapre prensip sekirite done yo itilize toupatou yo, ou gen dwa pou w mande yon kopi done nou genyen sou kont ou a nenpòt kilè, oswa ou ka mande pou yo efase kont machann ou a nèt si w kontakte ekip nou an.",
        }
      ]
    }
  };

  const currentData = content[language];

  return (
    <div className="min-h-screen bg-[#020B14] text-[#AAB3C2] selection:bg-[#FF4A1C]/30 selection:text-white">
      {/* Background Glows */}
      <div className="fixed top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#1E2A38]/20 to-transparent pointer-events-none" />
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#34A853]/5 blur-[150px] rounded-full pointer-events-none" />
      
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
              <Link href="/terms" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-[#AAB3C2] hover:bg-[#07111F] hover:border-[#1E2A38] hover:text-white font-medium transition-colors">
                <Scale className="w-4 h-4" />
                {language === "en" ? "Terms of Service" : language === "ht" ? "Kondisyon" : "Conditions d'utilisation"}
              </Link>
              <Link href="/privacy" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07111F] border border-[#1E2A38] text-white font-bold transition-colors">
                <Shield className="w-4 h-4 text-[#34A853]" />
                {language === "en" ? "Privacy Policy" : language === "ht" ? "Konfidansyalite" : "Politique de confidentialité"}
              </Link>
            </nav>
            
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-b from-[#07111F] to-[#020B14] border border-[#1E2A38]">
              <Lock className="w-8 h-8 text-[#34A853] mb-4" />
              <h4 className="text-white font-bold mb-2">Chiffrement AES-256</h4>
              <p className="text-xs text-[#AAB3C2] leading-relaxed">Toutes vos informations sensibles sont chiffrées selon les standards militaires les plus stricts.</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:w-3/4 max-w-3xl">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2A38]/30 border border-[#1E2A38] text-xs font-bold text-white mb-6">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
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
                <div className="prose prose-invert prose-p:text-[#AAB3C2] prose-p:leading-loose prose-p:text-[15px] prose-a:text-[#34A853] max-w-none">
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
