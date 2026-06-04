import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingBackground } from "@/components/landing/FloatingBackground";

export const metadata = {
  title: "Politique de Confidentialité — Kobara",
  description: "Découvrez comment Kobara protège, sécurise et gère vos données personnelles et clés API.",
};

const SECTIONS = [
  {
    id: "qui-sommes-nous",
    title: "1. Qui sommes-nous",
    content: `Kobara est une infrastructure fintech moderne permettant aux entreprises, développeurs et plateformes numériques d’accepter des paiements électroniques via API, liens de paiement et interfaces marchandes.

Kobara agit comme :
• Fournisseur technologique ;
• Plateforme de traitement de paiements ;
• Fournisseur d’outils développeurs ;
• Gestionnaire d’infrastructure de paiement.`
  },
  {
    id: "objectif",
    title: "2. Objectif de cette politique",
    content: `Cette politique vise à :
• Protéger les données de nos utilisateurs et marchands ;
• Garantir une transparence totale sur le traitement des données ;
• Respecter nos obligations légales et réglementaires de sécurité ;
• Limiter de manière proactive les abus et tentatives de fraude ;
• Encadrer rigoureusement l’utilisation des APIs Kobara ;
• Protéger l’infrastructure globale de Kobara contre les usages malveillants.`
  },
  {
    id: "informations-collectees",
    title: "3. Informations collectées",
    subsections: [
      {
        subtitle: "3.1 Informations de compte",
        body: "Lors de la création d’un compte Kobara, nous collectons : nom complet, nom de l’entreprise, e-mail professionnel, numéro de téléphone, adresse physique, mot de passe chiffré (bcrypt), informations KYC (Know Your Customer), informations fiscales, documents officiels d’identité, logo de l'entreprise et catégorie d’activité."
      },
      {
        subtitle: "3.2 Informations de paiement",
        body: "Lorsque des paiements sont traités sur notre infrastructure : montant, devise, identifiant unique de transaction, statut du paiement, références de transaction externes (MonCash), adresse IP, caractéristiques de l'appareil utilisé, type et version du navigateur, métadonnées associées, journaux d'activité technique et wallet de destination."
      },
      {
        subtitle: "3.3 Données techniques",
        body: "Kobara collecte automatiquement : logs d'API, requêtes HTTP entrantes, rapports d’erreurs, états de livraison des webhooks, activités développeur au sein du dashboard, type de périphérique, système d’exploitation, géolocalisation approximative basée sur l'IP, cookies techniques essentiels et identifiants de session chiffrés."
      },
      {
        subtitle: "3.4 Données développeur",
        body: "Lorsque vous interagissez avec nos SDKs, APIs, plugins et documentations, nous enregistrons : les clés API utilisées (hashées), les événements d'appels d'API, l'usage des SDKs, les erreurs d'intégration système, la fréquence et le volume des requêtes, ainsi que les journaux de sécurité."
      }
    ]
  },
  {
    id: "non-collectees",
    title: "4. Informations NON collectées",
    content: `Kobara applique le principe de minimisation des données. Nous ne collectons JAMAIS :
❌ Les mots de passe ou clés privées de vos wallets externes ;
❌ Les codes PIN mobiles ou secrets de portefeuilles partenaires ;
❌ Les informations bancaires secrètes non requises pour le traitement ;
❌ Les conversations privées ou contenus personnels n'ayant aucun lien avec les transactions de paiement.`
  },
  {
    id: "utilisation-donnees",
    title: "5. Utilisation des données",
    subsections: [
      {
        subtitle: "5.1 Fournir les services",
        body: "Traitement technique et instantané des paiements, génération et sécurisation des liens de paiement, distribution automatique des webhooks marchands, envoi des notifications système, gestion des profils marchands et génération sécurisée des clés API."
      },
      {
        subtitle: "5.2 Sécurité et Prévention des risques",
        body: "Détection temps réel de la fraude, blocage des bots malveillants, prévention active du blanchiment d'argent, protection de l'infrastructure contre les attaques DDoS, audits de sécurité système, limitation d'abus de bande passante/rate limiting et analyse comportementale suspecte."
      },
      {
        subtitle: "5.3 Support Client",
        body: "Fourniture de l'assistance technique, résolution proactive des bugs, processus de récupération sécurisée de compte, aide au debugging des intégrations API et amélioration continue des fonctionnalités de la plateforme."
      },
      {
        subtitle: "5.4 Obligations légales",
        body: "Conformité avec la réglementation financière locale et internationale, lutte active contre la fraude, respect des obligations comptables et fiscales, et exécution des demandes gouvernementales ou judiciaires légalement contraignantes."
      }
    ]
  },
  {
    id: "base-legale",
    title: "6. Base légale du traitement",
    content: `Le traitement de vos informations repose sur les fondements juridiques suivants :
• Votre consentement explicite (ex: inscription, newsletters) ;
• L'exécution contractuelle (ex: traitement des paiements des marchands) ;
• Le respect de nos obligations légales (ex: vérifications KYC/AML) ;
• Notre intérêt légitime à sécuriser notre infrastructure et à prévenir la fraude.`
  },
  {
    id: "cles-api",
    title: "7. Protection et gestion des clés API",
    subsections: [
      {
        subtitle: "7.1 Secret Keys (Clés Secrètes)",
        body: "Les clés secrètes (commençant par 'kobara_sk_') doivent être conservées exclusivement côté serveur et dans des environnements sécurisés (variables d'environnement). Elles ne doivent JAMAIS être exposées publiquement ou stockées côté client (JavaScript frontend, applications mobiles). Kobara se réserve le droit de suspendre ou révoquer automatiquement toute clé détectée sur un espace public (comme GitHub)."
      },
      {
        subtitle: "7.2 Public Keys (Clés Publiques)",
        body: "Les clés publiques (commençant par 'kobara_pk_') peuvent être utilisées de manière sécurisée côté frontend ou dans les SDK mobiles pour initialiser des fenêtres de checkout de paiement. Elles restent strictement restreintes aux opérations ne nécessitant aucune élévation de privilèges."
      }
    ]
  },
  {
    id: "securite-donnees",
    title: "8. Sécurité des données",
    content: `Kobara met en œuvre des protocoles de sécurité de niveau bancaire :
• HTTPS et TLS obligatoires pour tous les flux réseau ;
• Chiffrement fort des bases de données au repos et en transit ;
• Hachage bcrypt à haute valeur de sel pour les mots de passe ;
• Rate limiting automatique et protection anti-DDoS ;
• Isolation stricte des environnements marchands ;
• Signatures cryptographiques HMAC SHA256 obligatoires sur les webhooks ;
• Audit logs immuables de toutes les actions sensibles effectuées sur le système ;
• Rotation fréquente des secrets et surveillance proactive des anomalies.`
  },
  {
    id: "conservation",
    title: "9. Conservation des données",
    content: `Nous conservons les données aussi longtemps que nécessaire pour fournir nos services et pour nous conformer aux lois en vigueur. 
• Les données transactionnelles et KYC peuvent être archivées pour une durée minimale requise par les lois fiscales et de lutte contre le blanchiment d'argent.
• Les logs techniques et logs d'API sont automatiquement purgés ou anonymisés périodiquement après 30 jours, sauf enquête ou anomalie de sécurité en cours.`
  },
  {
    id: "partage",
    title: "10. Partage des données",
    content: `Kobara ne vend, ne loue et ne cède AUCUNE donnée personnelle à des fins marketing ou commerciales.
Le partage de données est strictement restreint à :
• Nos partenaires financiers et techniques (ex: MonCash pour valider les flux) ;
• Nos hébergeurs et infrastructures serveurs hautement sécurisés (Vercel, Supabase) ;
• Les autorités judiciaires ou régulateurs légitimes en cas d'obligation légale ou suspicion étayée de fraude.`
  },
  {
    id: "restrictions",
    title: "11. Restrictions d’utilisation",
    content: `L'utilisation des services Kobara is strictement interdite pour les activités suivantes :
• Tentatives de fraude, arnaques ou phishing ;
• Blanchiment d'argent ou financement d'activités illicites ;
• Vente de biens ou de services interdits par la législation en vigueur ;
• Manipulation financière ou spamming de l'infrastructure de paiement ;
• Attaques informatiques (injection, scan de vulnérabilités, DDoS).

Tout manquement entraînera une suspension immédiate et irréversible de votre compte sans préavis.`
  },
  {
    id: "cookies",
    title: "12. Cookies et technologies similaires",
    content: `Kobara utilise des cookies purement techniques et de sécurité pour :
• Gérer les sessions d'authentification active (NextAuth) ;
• Valider la sécurité de vos requêtes (protection CSRF) ;
• Mémoriser vos préférences d'affichage (ex: mode sombre/clair) ;
• Mesurer les performances et la stabilité de notre plateforme de checkout.

Ces cookies sont essentiels. Vous pouvez restreindre les cookies via votre navigateur, mais certaines parties de Kobara deviendront alors inaccessibles.`
  },
  {
    id: "webhooks-securite",
    title: "13. Sécurisation des Webhooks",
    content: `Les webhooks transmettent des données transactionnelles cruciales aux serveurs des marchands.
Pour garantir leur intégrité, les marchands s'engagent à :
• Utiliser obligatoirement des endpoints sécurisés en HTTPS ;
• Valider systématiquement la signature HMAC SHA256 fournie dans les en-têtes ;
• Protéger les logs de leur serveur pour ne pas exposer le secret de signature ;
• Restreindre les IP autorisées à appeler leur endpoint webhook si nécessaire.

Kobara décline toute responsabilité en cas de fuite de données ou d'intrusion résultant d'une mauvaise implémentation ou d'un serveur marchand mal sécurisé.`
  },
  {
    id: "services-tiers",
    title: "14. Services tiers intégrés",
    content: `Kobara s'appuie sur des partenaires technologiques de classe mondiale pour son fonctionnement :
• Hébergement de l'application et des fonctions Edge (Vercel) ;
• Base de données sécurisée et RLS (Supabase) ;
• Envoi d'e-mails transactionnels sécurisés.

Ces services agissent conformément à nos instructions et appliquent des politiques de confidentialité conformes aux plus au standards de l'industrie.`
  },
  {
    id: "clients-finaux",
    title: "15. Données des clients finaux",
    content: `Les marchands utilisant Kobara sont les responsables de traitement exclusifs vis-à-vis des données personnelles de leurs propres clients finaux.
Kobara agit uniquement en tant que sous-traitant technique pour le traitement de la transaction de paiement.

Le marchand reste responsable de :
• La légitimité et la sécurité de la vente de ses produits/services ;
• Le respect des droits d'accès et de suppression de ses propres clients ;
• La gestion des remboursements et la publication de ses propres conditions de vente.`
  },
  {
    id: "suspension-enquetes",
    title: "16. Suspension et enquêtes",
    content: `Kobara se réserve le droit de suspendre temporairement ou définitivement un compte marchand, de bloquer les demandes de retrait de solde en cours, et de mener des enquêtes manuelles approfondies en cas de :
• Suspicion de fraude, de rétrofacturation excessive ou d'activité anormale ;
• Non-respect flagrant de la présente Politique ou des Conditions d'Utilisation ;
• Réquisition judiciaire ou signalement par un de nos partenaires de paiement.`
  },
  {
    id: "droits-utilisateurs",
    title: "17. Droits des utilisateurs",
    content: `En tant qu'utilisateur Kobara, vous disposez des droits suivants :
• Droit d'accès et de rectification de vos données depuis votre Dashboard ;
• Droit à l'effacement (sous réserve du respect des durées de conservation fiscales et AML obligatoires) ;
• Droit d'exportation de vos données transactionnelles ;
• Droit de fermer votre compte à tout moment.

Pour exercer ces droits, vous pouvez soumettre une demande formelle à notre support technique.`
  },
  {
    id: "mineurs",
    title: "18. Protection des mineurs",
    content: "L'utilisation de la plateforme Kobara est strictement réservée aux personnes majeures et juridiquement capables de contracter, ou disposant d'une autorisation légale expresse de leurs représentants légaux."
  },
  {
    id: "responsabilite",
    title: "19. Limitation de responsabilité",
    content: `Kobara s'efforce de garantir la plus haute disponibilité de son infrastructure de paiement. Toutefois, Kobara ne saurait être tenu pour responsable :
• Des interruptions temporaires de service dues à des opérations de maintenance ou des pannes du réseau MonCash ;
• Des pertes financières causées par l'exposition accidentelle ou volontaire de vos Secret Keys par vos développeurs ;
• Des failles de sécurité touchant directement vos serveurs ou vos bases de données ;
• Des erreurs d'intégration logicielle côté marchand.`
  },
  {
    id: "modifications",
    title: "20. Modifications de la présente politique",
    content: "Kobara peut réviser cette Politique de Confidentialité à tout moment pour refléter les évolutions technologiques, législatives ou fonctionnelles. Les modifications importantes seront signalées de manière visible sur notre site officiel, via votre Dashboard marchand, ou directement par e-mail."
  },
  {
    id: "contact",
    title: "21. Contact et support",
    content: "Pour toute question relative à la confidentialité de vos données, à la gestion de vos informations personnelles ou pour signaler une vulnérabilité de sécurité, veuillez contacter le support officiel de Kobara via votre espace client ou par e-mail à l'adresse support."
  },
  {
    id: "juridiction",
    title: "23. Juridiction et conformité",
    content: "Cette Politique de Confidentialité est régie par les lois applicables au territoire d'exploitation de la plateforme Kobara, dans le respect strict des réglementations régissant les infrastructures fintech, la protection des données personnelles et les services de paiement numérique."
  }
];

export default function PrivacyPage() {
  return (
    <main className="relative min-h-[100dvh] selection:bg-rose-100 selection:text-rose-900 overflow-hidden">
      <FloatingBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-44 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 mb-6 backdrop-blur-md">
            🔒 RGPD & Normes Fintech Sécurisées
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-kobara-primary mb-6">
            Confidentialité
          </h1>
          <p className="text-lg md:text-xl text-kobara-secondary max-w-3xl mx-auto font-medium leading-relaxed">
            Chez Kobara, la sécurité de votre infrastructure de paiement et la confidentialité absolue de vos données marchandes et transactionnelles sont nos priorités absolues.
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

            {/* Right Main Policy Content */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Custom Banner / Introduction */}
              <div className="bg-white/60 backdrop-blur-md border border-white/90 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl -z-10" />
                <h3 className="text-xl font-bold text-kobara-primary mb-4">Préambule</h3>
                <p className="text-kobara-secondary font-medium leading-relaxed mb-6">
                  Cette Politique de Confidentialité explique comment Kobara collecte, utilise, protège, partage et conserve les informations personnelles des utilisateurs, marchands, développeurs, clients finaux et visiteurs utilisant la plateforme Kobara, les APIs, les SDKs, les pages de paiement, les webhooks, les plugins et les services associés.
                </p>
                <div className="p-4 bg-white/80 border border-white/90 rounded-2xl flex items-start gap-4 shadow-sm">
                  <span className="text-2xl mt-0.5">🤝</span>
                  <p className="text-xs text-kobara-secondary leading-relaxed">
                    En utilisant les services technologiques et financiers de Kobara, vous acceptez sans réserve les pratiques décrites dans cette Politique de Confidentialité. Nous nous engageons à n'utiliser vos données que dans le cadre exclusif de la fourniture et de la sécurisation de vos transactions de paiement.
                  </p>
                </div>
              </div>

              {/* Developer Security Summary Section */}
              <div id="resume-securite" className="bg-white/60 backdrop-blur-md border border-white/90 rounded-3xl p-8 relative overflow-hidden scroll-mt-28">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-100/20 rounded-full blur-2xl" />
                
                <h2 className="text-2xl font-black tracking-tight text-kobara-primary mb-2 flex items-center gap-2">
                  <span>22. Résumé de Sécurité Développeur</span>
                </h2>
                <p className="text-sm text-kobara-secondary font-medium mb-8">
                  Synthèse obligatoire des bonnes pratiques d'intégration à destination des ingénieurs et intégrateurs.
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
                        "Utiliser exclusivement des connexions HTTPS sécurisées.",
                        "Protéger et stocker de manière hermétique vos Secret Keys.",
                        "Vérifier systématiquement la signature HMAC SHA256 des webhooks.",
                        "Utiliser des variables d'environnement confidentielles.",
                        "Limiter et isoler les accès à vos serveurs de base de données.",
                        "Enregistrer et auditer les événements transactionnels critiques."
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
                        "Exposer des Secret Keys publiquement (ex: GitHub).",
                        "Stocker des données de paiement sensibles sans chiffrement.",
                        "Injecter des Secret Keys dans du code JavaScript côté client.",
                        "Bypasser l'utilisation légitime des passerelles d'API Kobara.",
                        "Désactiver ou contourner les protections de sécurité natives."
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
