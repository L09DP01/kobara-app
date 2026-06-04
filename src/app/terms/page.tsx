import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingBackground } from "@/components/landing/FloatingBackground";

export const metadata = {
  title: "Conditions d’Utilisation (Terms of Service) — Kobara",
  description: "Découvrez les conditions d’utilisation régissant l'accès à la plateforme, aux APIs et aux services fintech Kobara.",
};

const SECTIONS = [
  {
    id: "definitions",
    title: "1. Définitions clés",
    subsections: [
      {
        subtitle: "“Kobara”",
        body: "Désigne la plateforme technologique, les services fintech, les APIs, les SDKs, les outils développeurs et l’ensemble des infrastructures informatiques et de communication associées éditées par Kobara."
      },
      {
        subtitle: "“Utilisateur”",
        body: "Toute personne physique ou morale accédant ou utilisant le site, les APIs, les SDKs, les pages de paiement ou les services de la plateforme Kobara."
      },
      {
        subtitle: "“Merchant” (Marchand)",
        body: "Toute entreprise, plateforme numérique, boutique en ligne ou développeur disposant d'un compte marchand Kobara validé et utilisant l'infrastructure pour recevoir des paiements."
      },
      {
        subtitle: "“Client Final”",
        body: "Toute personne physique ou morale effectuant un paiement ou initiant une transaction financière en faveur d'un Marchand via les interfaces ou les liens de paiement Kobara."
      }
    ]
  },
  {
    id: "description-services",
    title: "2. Description des services",
    content: `Kobara fournit une infrastructure technologique et financière complète permettant de :
• Intégrer des passerelles de paiement électronique via des APIs fintech robustes ;
• Générer des liens de paiement dynamiques et partageables (WhatsApp, e-mail, réseaux sociaux) ;
• Recevoir des notifications instantanées de transactions via des Webhooks hautement sécurisés ;
• Suivre et piloter l'activité financière via un Dashboard marchand moderne ;
• Faciliter les demandes et la gestion des retraits de solde ;
• Fournir des rapports d'analytics, de facturation et d'audit logs.

Kobara agit strictement en qualité de plateforme technologique facilitant le traitement technique des flux de paiement.`
  },
  {
    id: "eligibilite",
    title: "3. Conditions d’éligibilité",
    content: `Pour s'inscrire et utiliser légitimement les services Kobara, vous devez :
• Avoir la pleine capacité légale et juridique de contracter et d'exercer une activité commerciale ;
• Fournir des informations authentiques, vérifiables et à jour lors de votre inscription ;
• Respecter scrupuleusement l'ensemble des lois locales et réglementations sectorielles en vigueur ;
• Ne pas utiliser l'infrastructure de Kobara pour promouvoir, faciliter ou exécuter des activités interdites.

Dans le cadre de la conformité KYC/AML, Kobara se réserve le droit de solliciter des documents complémentaires (documents d'identité, statuts d'entreprise, licences professionnelles) à tout moment.`
  },
  {
    id: "creation-compte",
    title: "4. Création et sécurité du compte",
    content: `Lors de la création de votre compte marchand :
• Vous vous engagez à fournir une adresse e-mail professionnelle valide et des identifiants réels ;
• Vos identifiants de connexion et mots de passe doivent rester strictement confidentiels ;
• Vous devez appliquer des mesures de protection appropriées (mot de passe fort, activation de la double authentification MFA).

L’utilisateur ou marchand est légalement et exclusivement responsable de la confidentialité de ses accès, de la sécurité de ses clés API et de l’ensemble des transactions initiées sous ses identifiants.`
  },
  {
    id: "apis-sdks",
    title: "5. Utilisation des APIs et SDKs",
    content: `Les APIs et SDKs de Kobara sont mis à disposition sous une licence limitée, personnelle, non exclusive, non transférable et entièrement révocable. Cette licence a pour but exclusif de vous permettre d'intégrer les fonctionnalités de paiement Kobara à vos propres sites ou applications.

Il est strictement interdit de :
• Revendre, louer ou sous-licencier les APIs ou SDKs Kobara à des tiers sans accord écrit préalable ;
• Cloner, copier ou créer des œuvres dérivées de la plateforme technologique Kobara ;
• Tenter de contourner les systèmes de limitation de requêtes (rate limiting) ou de sécurité ;
• Effectuer de l'ingénierie inverse à des fins malveillantes ou concurrentielles ;
• Surcharger volontairement notre infrastructure technique par des requêtes de masse anormales.`
  },
  {
    id: "cles-securite",
    title: "6. Secret Keys et responsabilités de sécurité",
    content: `Vos Secret Keys (commençant par 'kobara_sk_') constituent des accès hautement confidentiels. Elles :
• Doivent impérativement rester hébergées côté serveur et être isolées dans des variables d'environnement ;
• Ne doivent JAMAIS être exposées publiquement ou être injectées dans du code JavaScript côté client (frontend, applications mobiles).

Kobara décline toute responsabilité en cas de fuite de données, de transactions non autorisées ou d'interruptions résultant d'une Secret Key compromise par négligence de vos équipes. Kobara révoquera automatiquement et sans préavis toute clé détectée en clair sur le web.`
  },
  {
    id: "paiements-responsabilite",
    title: "7. Gestion des paiements et des transactions",
    content: `Kobara permet aux marchands d'accepter des paiements de manière fluide. Cependant, le marchand demeure le seul et unique responsable :
• De la conformité, de la légalité et de la livraison effective des produits ou services vendus à ses Clients Finaux ;
• De la gestion des demandes de remboursement et du traitement des litiges commerciaux ;
• Du respect de ses obligations fiscales et déclaratives locales associées à ses revenus d'activité.`
  },
  {
    id: "retraits-regles",
    title: "8. Retraits et régulation des soldes",
    content: `Les demandes de retrait vers vos portefeuilles partenaires ou comptes de destination sont soumises à :
• Des processus systématiques de validation de sécurité et d'antifraude ;
• La vérification du statut de conformité KYC complet du compte marchand ;
• La disponibilité réelle des fonds (frais de traitement Kobara déduits).

Kobara se réserve le droit de différer, suspendre ou annuler un retrait en cas d'enquête pour activité suspecte ou si la transaction sous-jacente présente un risque élevé de fraude.`
  },
  {
    id: "tarifs-frais",
    title: "9. Abonnements et frais de plateforme",
    content: `Kobara propose différentes offres incluant des plans gratuits et des formules premium aux limites d'usage étendues.
• Les transactions traitées par Kobara sont soumises à des frais de traitement standards calculés sur le montant brut de chaque transaction (2.9%).
• Tous les tarifs en vigueur sont affichés de manière transparente et peuvent être révisés par Kobara sous réserve d'une notification préalable par e-mail ou via votre Dashboard.`
  },
  {
    id: "activites-interdites",
    title: "10. Activités strictement interdites",
    content: `L'usage de Kobara est formellement interdit pour toute transaction ou activité liée à :
• Des opérations de blanchiment d'argent ou de financement d'organisations criminelles ;
• Des activités de phishing, arnaques, escroqueries, contrefaçons ou spams ;
• Des transactions illégales, des spéculations interdites ou l'usurpation d'identité ;
• Des cyberattaques ou l'injection consciente de logiciels malveillants ;
• Tout usage abusif visant à nuire à l'intégrité technique ou opérationnelle des serveurs de Kobara.`
  },
  {
    id: "suspension",
    title: "11. Suspension et fermeture de compte",
    content: `Kobara est en droit de suspendre, restreindre temporairement ou fermer de manière définitive tout compte marchand :
• En cas de violation flagrante de ces Conditions d'Utilisation ;
• En cas de détection d'opérations frauduleuses ou à haut risque juridique ;
• Sur réquisition légitime des autorités financières ou judiciaires compétentes.

Cette action peut intervenir immédiatement et sans préavis, les soldes restants pouvant être gelés le temps de l'investigation.`
  },
  {
    id: "disponibilite",
    title: "12. Disponibilité et SLA",
    content: `Kobara s'engage à fournir ses meilleurs efforts pour assurer une disponibilité technique optimale et continue de son infrastructure. Néanmoins, nous ne garantissons pas :
• Une disponibilité ininterrompue ou exempte de bugs à 100% ;
• Le fonctionnement infaillible des passerelles externes indépendantes de notre volonté (réseaux télécoms ou API MonCash).

Des suspensions momentanées peuvent survenir lors de maintenances planifiées, de déploiements correctifs majeurs ou de cas de force majeure.`
  },
  {
    id: "webhooks-gestion",
    title: "13. Responsabilités liées aux Webhooks",
    content: `Les serveurs marchands recevant les webhooks Kobara doivent être configurés avec soin :
• Le marchand est seul garant de la sécurité de son point de terminaison (endpoint) HTTPS ;
• Le marchand s'engage à authentifier cryptographiquement chaque requête entrante à l'aide de sa clé de signature HMAC SHA256 pour écarter tout faux signal.

Kobara ne pourra être tenu responsable des dysfonctionnements, usurpations d'identité ou pertes financières découlant d'un endpoint webhook non ou mal sécurisé.`
  },
  {
    id: "propriete-intellectuelle",
    title: "14. Propriété intellectuelle",
    content: `Kobara conserve la propriété exclusive et entière de l'intégralité de sa propriété intellectuelle :
• La plateforme applicative, les codes sources, les APIs, les SDKs et la documentation technique ;
• Les marques déposées, les chartes graphiques, les interfaces utilisateur, les logos et les designs.

Aucune disposition des présentes Conditions ne saurait être interprétée comme un transfert de propriété ou l'octroi d'un droit de propriété industrielle à l'égard de l'utilisateur.`
  },
  {
    id: "limitation-responsabilite",
    title: "15. Limitation générale de responsabilité",
    content: `Dans toute la mesure permise par le droit applicable, Kobara ne saurait être tenu pour responsable :
• Des pertes financières indirectes, des pertes d'exploitation, de chiffre d'affaires, de clients ou de données subies par le marchand ;
• Des dommages résultant d'une intégration logicielle défaillante, d'erreurs de code ou d'une mauvaise utilisation de nos outils d'intégration.

La responsabilité cumulée de Kobara, toutes causes confondues, ne pourra en aucun cas excéder le montant total des frais de transaction perçus par Kobara sur le compte du marchand durant les trois (3) mois précédant l'incident.`
  },
  {
    id: "obligations-marchand",
    title: "16. Engagements et obligations du marchand",
    content: `Le marchand utilisateur de Kobara s'engage formellement à :
• Respecter scrupuleusement les lois de sa juridiction d'exploitation ;
• Déclarer et s'acquitter de toutes les taxes locales afférentes à ses ventes ;
• Protéger de manière optimale les informations personnelles de ses propres clients (conformément à la législation sur la protection de la vie privée) ;
• Garantir l'isolation logique de son backend et sécuriser ses clés secrètes.`
  },
  {
    id: "compliance-kyc",
    title: "17. Processus de conformité KYC et Audit",
    content: `Kobara met en place des procédures de vigilance rigoureuses. À ce titre :
• Nous pouvons à tout moment auditer l'activité de votre compte marchand et solliciter des justificatifs ;
• En cas de refus de votre part ou de fourniture de pièces non valides, Kobara se réserve le droit de restreindre vos plafonds de retrait ou de suspendre temporairement le traitement des transactions.`
  },
  {
    id: "donnees-personnelles",
    title: "18. Protection des données personnelles",
    content: "La collecte et le traitement de vos données personnelles ainsi que de celles de vos clients sont strictement régis par les termes de notre Politique de Confidentialité, accessible de manière permanente sur notre site."
  },
  {
    id: "force-majeure",
    title: "19. Exonération pour cas de force majeure",
    content: "Kobara ne pourra être tenu pour responsable de l'inexécution ou des retards d'exécution de ses obligations contractuelles en cas de force majeure, incluant mais ne se limitant pas aux catastrophes naturelles, conflits armés, pannes généralisées d'Internet, coupures d'hébergeurs cloud globaux ou décisions réglementaires imprévisibles."
  },
  {
    id: "resiliation",
    title: "20. Résiliation et effets",
    content: `Chaque utilisateur ou marchand peut résilier ses engagements et fermer son compte Kobara à tout moment via son espace client, sous réserve du règlement intégral de tout frais ou solde débiteur en suspens.
• Kobara peut résilier ou suspendre le compte du marchand pour convenance ou motif légitime sous réserve d'un préavis raisonnable.
• Les obligations relatives à la sécurité, à la propriété intellectuelle, à la conservation légale des logs d'audit et à la limitation de responsabilité survivent à la résiliation des présentes Conditions.`
  },
  {
    id: "modifications-conditions",
    title: "21. Modifications des conditions d’utilisation",
    content: "Kobara est susceptible d'actualiser les présentes Conditions d'Utilisation périodiquement. En cas de modification substantielle, les marchands seront avertis par e-mail ou par le biais d'un message d'alerte sur leur Dashboard. Votre utilisation continue de l'infrastructure de paiement Kobara après l'entrée en vigueur des modifications vaut acceptation pleine et entière des nouvelles conditions."
  },
  {
    id: "sdk-utilisateurs",
    title: "23. Clause spécifique d'utilisation des SDKs",
    content: `Les kits de développement logiciel (SDKs) fournis par Kobara sont mis à disposition « EN L'ÉTAT » (AS IS), sans garantie d'aucune sorte quant à leur compatibilité universelle ou leur absence absolue de bugs. 
Les développeurs marchands s'engagent à :
• Tester rigoureusement leurs workflows d'intégration au sein de l'environnement de sandbox de test ;
• Valider la capture et le traitement des retours de transactions avant tout basculement en mode production.`
  },
  {
    id: "juridiction-competente",
    title: "24. Droit applicable et juridiction compétente",
    content: "Les présentes Conditions d'Utilisation sont régies par les lois applicables au territoire d'établissement de Kobara. Tout litige relatif à la formation, l'interprétation ou l'exécution des présentes Conditions qui ne pourrait être résolu à l'amiable sera soumis à la compétence exclusive des tribunaux du siège social de Kobara."
  },
  {
    id: "contact-support",
    title: "25. Contact",
    content: "Pour toute assistance, clarification concernant les présentes conditions, gestion de litige, ou pour signaler une violation de sécurité, nos équipes d'assistance sont disponibles via les canaux de support du Dashboard Kobara."
  }
];

export default function TermsPage() {
  return (
    <main className="relative min-h-[100dvh] selection:bg-rose-100 selection:text-rose-900 overflow-hidden">
      <FloatingBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-44 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 mb-6 backdrop-blur-md">
            ⚖️ Accord & Conditions Générales Fintech
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-kobara-primary mb-6">
            Conditions d'Utilisation
          </h1>
          <p className="text-lg md:text-xl text-kobara-secondary max-w-3xl mx-auto font-medium leading-relaxed">
            Les présentes Conditions Générales d’Utilisation régissent de manière contractuelle votre accès et l'utilisation de l'ensemble de l'infrastructure fintech de Kobara.
          </p>
          <div className="mt-8 text-sm text-kobara-secondary font-medium">
            Dernière mise à jour : <span className="text-kobara-primary font-bold">9 mai 2026</span>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Left Sidebar Table of Contents */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 space-y-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                <p className="text-xs font-bold uppercase tracking-wider text-kobara-secondary px-3 mb-4">Table des matières</p>
                <a
                  href="#resume-securite"
                  className="block text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 hover:bg-rose-100/50 transition-all"
                >
                  🛡️ Synthèse Sécurité Développeur
                </a>
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm font-medium text-kobara-secondary hover:text-kobara-primary hover:translate-x-1 transition-all rounded-lg px-3 py-1.5"
                  >
                    {section.title.split(".")[1] || section.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Right Main Conditions Content */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Custom Banner / Introduction */}
              <div className="bg-white/60 backdrop-blur-md border border-white/90 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl -z-10" />
                <h3 className="text-xl font-bold text-kobara-primary mb-4">Préambule contractuel</h3>
                <p className="text-kobara-secondary font-medium leading-relaxed mb-6">
                  Les présentes Conditions d’Utilisation (“Terms of Service”) régissent de manière obligatoire l’accès et l’utilisation du site Kobara, des APIs Kobara, des SDKs Kobara, des pages de paiement (checkout), des webhooks de livraison, des plugins e-commerce, du dashboard marchand et de l'ensemble des services fintech Kobara.
                </p>
                <div className="p-4 bg-white/80 border border-white/90 rounded-2xl flex items-start gap-4 shadow-sm">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <p className="text-xs text-kobara-secondary leading-relaxed">
                    En créant un compte marchand ou en intégrant Kobara, vous déclarez accepter l’intégralité des présentes conditions. Si vous n’acceptez pas ces conditions ou si vous agissez en contradiction avec nos règles d'intégration, vous devez cesser immédiatement d'utiliser les services de Kobara.
                  </p>
                </div>
              </div>

              {/* Developer Security Summary Section (Section 22) */}
              <div id="resume-securite" className="bg-white/60 backdrop-blur-md border border-white/90 rounded-3xl p-8 relative overflow-hidden scroll-mt-28">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-100/20 rounded-full blur-2xl" />
                
                <h2 className="text-2xl font-black tracking-tight text-kobara-primary mb-2 flex items-center gap-2">
                  <span>22. Résumé de Sécurité Développeur</span>
                </h2>
                <p className="text-sm text-kobara-secondary font-medium mb-8">
                  Synthèse des exigences et interdictions contractuelles imposées aux équipes de développement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Obligations */}
                  <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-2xl p-6">
                    <h3 className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">OBLIGATOIRE</span>
                      Pratiques Requises
                    </h3>
                    <ul className="space-y-3.5">
                      {[
                        "Utiliser obligatoirement des flux cryptés HTTPS sécurisés.",
                        "Vérifier la validité des signatures HMAC sur tous les webhooks reçus.",
                        "Assurer la confidentialité et la protection absolue des Secret Keys.",
                        "Garantir l'hébergement de votre logique d'API sur un serveur backend sécurisé.",
                        "Stocker vos clés privées exclusivement dans des variables d'environnement .env.",
                        "Logger et suivre de manière structurée les événements transactionnels critiques."
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-emerald-950 font-medium">
                          <span className="text-emerald-600 font-bold text-lg leading-none">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interdits */}
                  <div className="bg-rose-50/40 border border-rose-100/60 rounded-2xl p-6">
                    <h3 className="text-rose-700 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-800 border border-rose-200">INTERDIT</span>
                      Pratiques Proscrites
                    </h3>
                    <ul className="space-y-3.5">
                      {[
                        "Exposer ou publier vos Secret Keys (ex: dépôts git publics, forums).",
                        "Stocker des secrets, clés privées ou jetons côté frontend.",
                        "Contourner ou surcharger les mécanismes de protection Kobara.",
                        "Effectuer du scraping intensif, du reverse engineering ou du scan de serveurs.",
                        "Bypasser l'utilisation de l'API officielle Kobara par des requêtes non documentées."
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-rose-950 font-medium">
                          <span className="text-rose-600 font-bold text-lg leading-none">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Loop over robust sections */}
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white/60 backdrop-blur-md border border-white/90 rounded-3xl p-8 hover:border-neutral-200 transition-all scroll-mt-28"
                >
                  <h2 className="text-2xl font-black text-kobara-primary tracking-tight mb-4">
                    {section.title}
                  </h2>

                  {section.content && (
                    <p className="text-kobara-secondary font-medium leading-relaxed whitespace-pre-line text-sm md:text-base">
                      {section.content}
                    </p>
                  )}

                  {section.subsections && (
                    <div className="space-y-6 mt-6">
                      {section.subsections.map((sub, idx) => (
                        <div key={idx} className="p-5 bg-white/80 border border-neutral-100 rounded-2xl">
                          <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-2">
                            {sub.subtitle}
                          </h3>
                          <p className="text-kobara-secondary font-medium leading-relaxed text-sm">
                            {sub.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
