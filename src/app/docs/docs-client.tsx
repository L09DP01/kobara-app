'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export function DocsClient({ 
  testPublicKey, 
  testSecretKey,
  livePublicKey,
  isAuthenticated
}: { 
  testPublicKey: string, 
  testSecretKey: string,
  livePublicKey: string,
  isAuthenticated: boolean
}) {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Intersection Observer for highlighting the active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const NavItem = ({ id, label, isSubItem = false }: { id: string, label: string, isSubItem?: boolean }) => {
    const isActive = activeSection === id;
    return (
      <button 
        onClick={() => scrollToSection(id)}
        className={clsx(
          "w-full text-left py-2 px-4 transition-colors text-sm rounded-lg flex items-center gap-3",
          isActive
            ? "text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed/10 border-l-4 border-secondary dark:border-secondary-fixed-dim font-semibold rounded-l-none"
            : "text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-primary-fixed-dim/10 transition-colors hover:bg-surface-container-high dark:hover:bg-primary-container",
          isSubItem && "pl-8"
        )}
      >
        <span>{label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="py-6 space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">Getting Started</h3>
        <NavItem id="quickstart" label="Quickstart" />
        <NavItem id="authentication" label="Authentication" />
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">SDKs & Libraries</h3>
        <NavItem id="javascript-sdk" label="JavaScript SDK" />
        <NavItem id="nodejs-sdk" label="Node.js SDK" />
        <NavItem id="python-sdk" label="Python SDK" />
        <NavItem id="php-sdk" label="PHP SDK" />
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">Integrations</h3>
        <NavItem id="wordpress-plugin" label="WordPress Plugin" />
        <NavItem id="ai-integration" label="AI Integration" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">Core API</h3>
        <NavItem id="payments" label="Payments" />
        <NavItem id="payment-links" label="Payment Links" />
        <NavItem id="webhooks" label="Webhooks" />
        <NavItem id="withdrawals" label="Withdrawals" />
        <NavItem id="metadata-expansion" label="Metadata & Expansion" />
        <NavItem id="errors" label="Errors" />
      </div>
    </div>
  );

  const CodeBlock = ({ title, code, language = 'json' }: { title?: string, code: string, language?: string }) => (
    <div className="bg-code-bg rounded-xl overflow-hidden shadow-sm my-4 border border-border-subtle">
      {title && (
        <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-white/50 text-xs font-mono-code">{title}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-white/50 hover:text-white transition-colors"
            title="Copier le code"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>
        </div>
      )}
      <pre className="p-4 text-[13px] font-mono-code text-white/90 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="bg-background-main font-body-base text-body-base text-on-surface antialiased min-h-screen flex selection:bg-primary/20">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed flex flex-col z-40 bg-surface-container-lowest dark:bg-primary-container text-primary dark:text-on-primary font-body-base text-body-base docked w-[260px] left-0 top-0 bottom-0 border-r border-border-subtle dark:border-outline-variant flat transition-transform duration-300 ease-in-out md:translate-x-0 md:flex",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header inside Sidebar */}
        <div className="px-6 py-8 flex justify-between items-start gap-1">
          <div className="flex flex-col gap-1">
            <Link href="/" className="font-bold text-xl flex items-center gap-2 text-primary dark:text-on-primary">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              Kobara <span className="text-text-secondary font-normal">Docs</span>
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-text-secondary hover:text-primary transition-colors mt-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-4 mt-4">
          <SidebarContent />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[260px] w-full md:w-[calc(100%-260px)]">
        
        {/* Top Nav */}
        <header className="bg-surface/80 backdrop-blur-md dark:bg-primary/80 text-primary dark:text-on-primary font-headline-md text-headline-md docked full-width top-0 sticky border-b border-border-subtle dark:border-outline-variant flat flex justify-between items-center h-20 px-container-padding z-30 transition-all duration-200 ease-in-out">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex flex-col">
              <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
                Documentation API
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://api.kobara.com" target="_blank" rel="noreferrer" className="hidden sm:flex text-sm text-text-secondary hover:text-text-primary items-center gap-1 transition-colors">
              API Status <span className="w-2 h-2 rounded-full bg-status-success"></span>
            </a>
            <div className="w-px h-4 bg-border-subtle hidden sm:block mx-2"></div>
            {isAuthenticated ? (
              <Link href="/dashboard" className="bg-surface-container hover:bg-surface-container-high text-text-primary px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border border-border-subtle shadow-sm">
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link href="/" className="bg-surface-container hover:bg-surface-container-high text-text-primary px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border border-border-subtle shadow-sm">
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-container-padding flex flex-col gap-8 max-w-[840px] mx-auto w-full py-10 min-w-0">
          
          {/* 1. Quickstart */}
          <section id="quickstart" className="mb-24 scroll-mt-24">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Quickstart</h1>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Bienvenue dans la documentation développeur de Kobara. Notre API RESTful vous permet d'accepter des paiements MonCash facilement, de manière sécurisée et rapide sur le marché haïtien.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono-code text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Obtenir vos clés API</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Créez un compte marchand sur Kobara pour accéder à vos clés API. Chaque compte dispose de clés de <strong className="text-text-primary">Test</strong> (pour le développement sans argent réel) et de <strong className="text-text-primary">Live</strong> (pour la production).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono-code text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sécuriser votre environnement</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Vos clés secrètes (<code className="text-xs bg-surface-container px-1 py-0.5 rounded">kbr_sk_...</code>) doivent être stockées dans vos variables d'environnement serveur. <strong>Ne les exposez jamais côté client.</strong> Utilisez l'en-tête <code className="text-xs bg-surface-container px-1 py-0.5 rounded">Authorization: Bearer</code>.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono-code text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Installer le SDK</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Choisissez le SDK correspondant à votre stack technologique (Node.js, PHP, Python...) pour accélérer votre intégration.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono-code text-sm">4</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Créer un paiement et configurer les webhooks</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Créez votre première intention de paiement. Configurez ensuite un endpoint webhook sur votre serveur pour écouter l'événement <code className="text-xs bg-surface-container px-1 py-0.5 rounded text-primary">payment.succeeded</code> de manière asynchrone.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-card border border-border-subtle rounded-xl p-5 mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-base mb-1">Base URL</h3>
                <p className="text-xs text-text-secondary">Toutes les requêtes API sont effectuées vers cette URL.</p>
              </div>
              <div className="bg-surface-container px-3 py-2 rounded-md flex items-center gap-3 border border-border-subtle">
                <code className="text-[13px] font-mono-code text-primary">https://api.kobara.com/api/v1</code>
                <button 
                  onClick={() => navigator.clipboard.writeText("https://api.kobara.com/api/v1")}
                  className="text-text-secondary hover:text-primary transition-colors"
                  title="Copier"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
          </section>

          <hr className="border-border-subtle mb-16" />

          {/* 2. Authentication */}
          <section id="authentication" className="mb-24 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              L'API Kobara utilise des clés secrètes pour authentifier vos requêtes. 
              Vous devez envoyer cette clé dans l'en-tête HTTP <code className="bg-surface-container px-1 py-0.5 rounded text-sm">Authorization</code> sous forme de <strong>Bearer token</strong>. Toutes les requêtes doivent être effectuées via <strong>HTTPS</strong>. Les requêtes non sécurisées en HTTP seront refusées.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-card border border-border-subtle p-5 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-status-success text-[20px]">public</span> 
                  Clés Publiques
                </h4>
                <p className="text-sm text-text-secondary mb-3">Préfixes : <code className="text-xs bg-surface-container px-1 py-0.5 rounded">kbr_pk_test_</code> ou <code className="text-xs bg-surface-container px-1 py-0.5 rounded">_live_</code></p>
                <p className="text-xs text-text-secondary">Peuvent être exposées côté client (ex: React, mobile) de manière sécurisée pour initialiser l'interface de paiement.</p>
              </div>
              <div className="bg-surface-card border border-border-subtle p-5 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-status-error text-[20px]">vpn_key</span> 
                  Clés Secrètes
                </h4>
                <p className="text-sm text-text-secondary mb-3">Préfixes : <code className="text-xs bg-surface-container px-1 py-0.5 rounded">kbr_sk_test_</code> ou <code className="text-xs bg-surface-container px-1 py-0.5 rounded">_live_</code></p>
                <p className="text-xs text-text-secondary">Permettent d'effectuer toute action sur votre compte (créer un paiement, rembourser). À conserver jalousement côté serveur.</p>
              </div>
            </div>
            
            <div className="bg-status-error/10 border-l-4 border-status-error p-4 rounded-r-lg mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-status-error mt-0.5">security</span>
                <div>
                  <h4 className="text-sm font-semibold text-status-error">Attention de sécurité (Système Bazik)</h4>
                  <p className="text-sm text-status-error/90 mt-1">
                    En tant que marchand Kobara, vous n'interagissez <strong>jamais</strong> directement avec les clés du fournisseur sous-jacent (Bazik). N'envoyez jamais vos jetons Bazik à l'API Kobara ni à vos clients. Seules les clés préfixées par <code className="font-mono-code font-bold">kobara_</code> sont valides.
                  </p>
                </div>
              </div>
            </div>

            <CodeBlock 
              title="Exemple de requête cURL authentifiée"
              language="bash"
              code={`curl https://api.kobara.com/api/v1/payments \\
  -H "Authorization: Bearer ${testSecretKey}" \\
  -H "Content-Type: application/json"`} 
            />
          </section>

          <hr className="border-border-subtle mb-16" />

          {/* 3. SDKs & Libraries */}
          <section id="javascript-sdk" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-8">SDKs & Libraries</h2>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#f7df1e] text-[28px]">javascript</span>
              <h3 className="text-xl font-bold">JavaScript SDK</h3>
            </div>
            <p className="text-text-secondary text-sm mb-6">Pour intégrer Kobara dans vos applications front-end modernes (React, Vue, Vanilla JS).</p>
            
            <div className="bg-surface-container px-4 py-3 rounded-lg border border-border-subtle mb-4 flex justify-between items-center">
              <code className="text-sm font-mono-code text-text-primary">npm install kobara-js</code>
            </div>

            <CodeBlock 
              title="Frontend Integration"
              language="javascript"
              code={`import Kobara from "kobara-js";

// Utilisez toujours la clé PUBLIQUE côté client
const kobara = new Kobara("${testPublicKey}");

async function handleCheckout() {
  const { error } = await kobara.checkout.create({
    amount: 1000,
    currency: "HTG",
    description: "Achat Boutique",
    // Options additionnelles...
  });
}`} 
            />
          </section>

          <section id="nodejs-sdk" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#83CD29] text-[28px]">data_object</span>
              <h3 className="text-xl font-bold">Node.js SDK</h3>
            </div>
            <p className="text-text-secondary text-sm mb-6">Le SDK officiel pour interagir avec l'API depuis votre backend Node.js, Express, NestJS ou Next.js (API Routes).</p>
            
            <div className="bg-surface-container px-4 py-3 rounded-lg border border-border-subtle mb-4 flex justify-between items-center">
              <code className="text-sm font-mono-code text-text-primary">npm install @kobara/node</code>
            </div>

            <CodeBlock 
              title="Backend Integration (Node.js)"
              language="javascript"
              code={`import Kobara from "@kobara/node";

// Instanciez avec la clé SECRÈTE depuis vos variables d'environnement
const kobara = new Kobara(process.env.KOBARA_SECRET_KEY);

app.post("/create-payment", async (req, res) => {
  try {
    const payment = await kobara.payments.create({
      amount: 1000,
      currency: "HTG",
      customer: {
        name: "Jean Exemple",
        phone: "50900000000"
      }
    });
    res.json({ paymentUrl: payment.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});`} 
            />
          </section>

          <section id="python-sdk" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#3776AB] text-[28px]">terminal</span>
              <h3 className="text-xl font-bold">Python SDK</h3>
            </div>
            <p className="text-text-secondary text-sm mb-6">Idéal pour les backends construits avec Django, Flask ou FastAPI.</p>
            
            <div className="bg-surface-container px-4 py-3 rounded-lg border border-border-subtle mb-4 flex justify-between items-center">
              <code className="text-sm font-mono-code text-text-primary">pip install kobara</code>
            </div>

            <CodeBlock 
              title="Backend Integration (Python)"
              language="python"
              code={`from fastapi import FastAPI
from kobara import Kobara
import os

app = FastAPI()
client = Kobara(api_key=os.environ.get("KOBARA_SECRET_KEY"))

@app.post("/checkout")
def create_checkout():
    payment = client.payments.create(
        amount=1000,
        currency="HTG",
        description="Achat FastAPI",
        success_url="https://mon-site.com/success"
    )
    return {"checkout_url": payment.url}`} 
            />
          </section>

          <section id="php-sdk" className="mb-24 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#777BB4] text-[28px]">code</span>
              <h3 className="text-xl font-bold">PHP SDK</h3>
            </div>
            <p className="text-text-secondary text-sm mb-6">Conçu pour les projets natifs PHP, Laravel, ou Symfony.</p>
            
            <div className="bg-surface-container px-4 py-3 rounded-lg border border-border-subtle mb-4 flex justify-between items-center">
              <code className="text-sm font-mono-code text-text-primary">composer require kobara/php-sdk</code>
            </div>

            <CodeBlock 
              title="Backend Integration (PHP)"
              language="php"
              code={`<?php
require 'vendor/autoload.php';

use Kobara\\KobaraClient;

$kobara = new KobaraClient(getenv('KOBARA_SECRET_KEY'));

$payment = $kobara->payments->create([
    "amount" => 1000,
    "currency" => "HTG",
    "description" => "Achat Laravel",
    "customer" => [
        "name" => "Marie Exemple",
        "phone" => "50900000000"
    ]
]);

header("Location: " . $payment->url);
exit();
?>`} 
            />
          </section>

          <hr className="border-border-subtle mb-16" />

          {/* 4. Integrations */}
          <section id="wordpress-plugin" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-8">Integrations</h2>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#21759B] text-[28px]">web</span>
              <h3 className="text-xl font-bold">WordPress Plugin</h3>
            </div>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              Acceptez les paiements MonCash sur votre boutique WooCommerce en quelques minutes, sans écrire de code, grâce au plugin officiel Kobara.
            </p>
            
            <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-8 mb-6">
              <div className="flex-1">
                <div className="flex gap-2 mb-4">
                  <span className="bg-surface-container text-text-secondary text-xs font-medium px-2 py-1 rounded">WordPress 6+</span>
                  <span className="bg-surface-container text-text-secondary text-xs font-medium px-2 py-1 rounded">WooCommerce Ready</span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-text-secondary text-sm">
                  <li>Téléchargez l'archive `.zip` ci-contre.</li>
                  <li>Allez dans <strong>Extensions &gt; Ajouter</strong> sur votre WordPress et téléversez le fichier.</li>
                  <li>Activez l'extension <strong>Kobara WooCommerce Gateway</strong>.</li>
                  <li>Dans les réglages WooCommerce (Paiements), renseignez vos clés Kobara Live & Test.</li>
                </ul>
              </div>
              <div className="md:w-56 flex-shrink-0 flex flex-col gap-3 justify-center">
                <a href="/downloads/kobara-wordpress-plugin.zip" download className="w-full bg-primary text-on-primary py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Plugin
                </a>
              </div>
            </div>
          </section>

          <section id="ai-integration" className="mb-24 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">auto_awesome</span>
              <h3 className="text-xl font-bold">AI Integration</h3>
            </div>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              Utilisez ce prompt système pour guider des assistants IA (Cursor, Claude, GPT, Lovable, Bolt) afin qu'ils intègrent l'API Kobara proprement dans votre base de code, en respectant les bonnes pratiques de sécurité et d'architecture.
            </p>
            
            <CodeBlock 
              title="Copier ce prompt dans votre IA"
              language="text"
              code={`Tu es un développeur full-stack senior. Intègre Kobara Payment dans mon application.

CONSIGNES STRICTES :
1. Utilise l'API REST de Kobara (pas Bazik directement).
2. Installe le SDK Kobara adapté à ma stack technique.
3. Crée un tunnel de paiement : crée une intention avec POST /api/v1/payments (côté serveur).
4. Gère les statuts 'pending', 'succeeded', 'failed' et 'expired' en base de données.
5. Configure un endpoint webhook sécurisé, vérifie systématiquement la signature 'Kobara-Signature'.
6. Utilise les variables d'environnement pour les clés secrètes Kobara (kbr_sk_...) et ne les expose JAMAIS côté client.`} 
            />
          </section>

          <hr className="border-border-subtle mb-16" />

          {/* 5. Core API */}
          <h2 className="text-2xl font-bold mb-8">Core API</h2>

          <section id="payments" className="mb-16 scroll-mt-24">
            <h3 className="text-xl font-bold mb-4">Payments</h3>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              L'objet Payment représente une tentative de prélèvement. Il permet de générer une session de paiement hébergée (Checkout) ou un paiement direct via API.
            </p>
            
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-status-success/15 text-status-success text-[11px] font-bold px-2 py-0.5 rounded border border-status-success/20">POST</span>
              <span className="font-mono-code text-sm font-medium">/api/v1/payments</span>
            </div>

            <h4 className="font-semibold text-sm mb-3">Idempotence</h4>
            <p className="text-sm text-text-secondary mb-6">
              Pour éviter les doubles paiements liés à des erreurs réseau, envoyez un en-tête <code className="bg-surface-container px-1 py-0.5 rounded">Idempotency-Key</code> unique (ex: un UUID) avec chaque requête <code className="text-xs">POST</code>. Les requêtes <code className="text-xs">GET</code> sont intrinsèquement idempotentes.
            </p>

            <CodeBlock 
              title="Création d'un paiement (Requête)"
              language="json"
              code={`{
  "amount": 2500,
  "currency": "HTG",
  "description": "Abonnement Premium (1 mois)",
  "customer": {
    "name": "Jean Exemple",
    "email": "jean@exemple.com",
    "phone": "50900000000"
  },
  "metadata": {
    "internal_order_id": "ORD-89457",
    "plan_tier": "premium"
  },
  "successUrl": "https://monsite.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://monsite.com/cancel"
}`} 
            />

            <CodeBlock 
              title="Réponse API (200 OK)"
              language="json"
              code={`{
  "id": "pay_9a8b7c6d5e4f3g2h1",
  "object": "payment",
  "amount": 2500,
  "currency": "HTG",
  "status": "pending",
  "url": "https://pay.kobara.com/c/pay_9a8b7c6d...",
  "metadata": {
    "internal_order_id": "ORD-89457",
    "plan_tier": "premium"
  },
  "created_at": 1715264000
}`} 
            />
          </section>

          <section id="payment-links" className="mb-16 scroll-mt-24">
            <h3 className="text-xl font-bold mb-4">Payment Links</h3>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              Générez des liens de paiement réutilisables. Idéal pour partager par SMS, WhatsApp, ou intégrer sur un bouton statique sans backend lourd.
            </p>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-status-success/15 text-status-success text-[11px] font-bold px-2 py-0.5 rounded border border-status-success/20">POST</span>
                <span className="font-mono-code text-sm font-medium">/api/v1/payment-links</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-primary/15 text-primary text-[11px] font-bold px-2 py-0.5 rounded border border-primary/20">GET</span>
                <span className="font-mono-code text-sm font-medium">/api/v1/payment-links</span>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              Paramètres notables : <code className="bg-surface-container px-1 py-0.5 rounded">title</code> (Nom du produit), <code className="bg-surface-container px-1 py-0.5 rounded">expires_at</code> (Date d'expiration optionnelle), <code className="bg-surface-container px-1 py-0.5 rounded">amount</code> (Laisser vide pour laisser le client choisir le montant, idéal pour des dons).
            </p>
          </section>

          <section id="webhooks" className="mb-16 scroll-mt-24">
            <h3 className="text-xl font-bold mb-4">Webhooks</h3>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              Kobara envoie des requêtes HTTP POST asynchrones à votre serveur pour vous notifier du changement de statut des ressources (ex: un paiement complété). C'est la méthode la plus robuste pour finaliser une commande.
            </p>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-sm mb-3">Événements principaux</h4>
                <ul className="space-y-2 text-sm font-mono-code text-primary">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> payment.succeeded</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-status-error"></div> payment.failed</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-status-warning"></div> payment.expired</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-status-success"></div> withdrawal.completed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Vérification de sécurité</h4>
                <p className="text-sm text-text-secondary mb-3">Votre serveur doit absolument vérifier la signature HMAC SHA-256 présente dans l'en-tête pour s'assurer que la requête provient bien de Kobara.</p>
                <div className="bg-surface-container p-3 rounded-lg border border-border-subtle space-y-1">
                  <div className="text-xs font-mono-code text-text-primary">Kobara-Signature: t=1715264...,v1=2f8a...</div>
                  <div className="text-xs font-mono-code text-text-primary">Kobara-Event: payment.succeeded</div>
                </div>
              </div>
            </div>
          </section>

          <section id="withdrawals" className="mb-16 scroll-mt-24">
            <h3 className="text-xl font-bold mb-4">Withdrawals</h3>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              Permet de demander le retrait des fonds accumulés sur votre balance marchande vers un portefeuille MonCash désigné.
            </p>
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-status-success/15 text-status-success text-[11px] font-bold px-2 py-0.5 rounded border border-status-success/20">POST</span>
              <span className="font-mono-code text-sm font-medium">/api/v1/withdrawals</span>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Les limites de retrait (quotidiennes/mensuelles) dépendent de votre niveau de KYC et de votre plan d'abonnement.
            </p>
            <CodeBlock 
              title="Exemple de réponse (200 OK)"
              code={`{
  "id": "wd_789abc123def",
  "object": "withdrawal",
  "amount": 15000,
  "status": "pending",
  "destination": {
    "type": "moncash",
    "account": "509XXXXXX"
  },
  "created_at": 1715265000
}`} 
            />
          </section>

          <section id="metadata-expansion" className="mb-16 scroll-mt-24">
            <h3 className="text-xl font-bold mb-4">Metadata & Expansion</h3>
            <h4 className="font-semibold text-sm mb-2">Métadonnées (Metadata)</h4>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              La plupart des objets (Payments, Links) acceptent un objet <code className="bg-surface-container px-1 py-0.5 rounded">metadata</code>. Vous pouvez y injecter jusqu'à 20 clés-valeurs (chaînes de caractères uniquement) pour lier l'objet Kobara à vos propres données (ex: <code className="bg-surface-container px-1 py-0.5 rounded">user_id</code>, <code className="bg-surface-container px-1 py-0.5 rounded">cart_id</code>). Ces métadonnées sont incluses dans les payloads de webhooks, simplifiant grandement votre logique de réconciliation.
            </p>

            <h4 className="font-semibold text-sm mb-2">Expansion des objets</h4>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Pour des raisons de performance, certains champs liés ne retournent que leur ID (ex: <code className="bg-surface-container px-1 py-0.5 rounded">customer: "cus_123"</code>). Utilisez le paramètre de requête <code className="bg-surface-container px-1 py-0.5 rounded">expand[]=customer</code> dans vos requêtes GET pour remplacer l'ID par l'objet complet. Limitez la profondeur d'expansion pour éviter des latences serveur.
            </p>
          </section>

          <section id="errors" className="mb-24 scroll-mt-24">
            <h3 className="text-xl font-bold mb-4">Errors</h3>
            <p className="text-text-secondary text-base mb-6 leading-relaxed">
              L'API utilise les codes HTTP standard. Les codes 2xx indiquent un succès. Les codes 4xx indiquent une erreur client (paramètres invalides, solde insuffisant). Les codes 5xx indiquent un problème côté Kobara.
            </p>
            
            <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm mb-8">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-container-lowest">
                    <th className="p-4 font-semibold text-text-primary w-24">Code</th>
                    <th className="p-4 font-semibold text-text-primary">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary">
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-success">200/201</td>
                    <td className="p-4"><strong>Success / Created</strong> - Tout s'est bien passé.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-warning">400</td>
                    <td className="p-4"><strong>Bad Request</strong> - La requête est malformée ou il manque des paramètres obligatoires. Lisez l'objet d'erreur retourné pour le détail.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-warning">401</td>
                    <td className="p-4"><strong>Unauthorized</strong> - Clé API invalide ou non fournie.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-warning">403</td>
                    <td className="p-4"><strong>Forbidden</strong> - La clé n'a pas les droits requis (ex: utilisation d'une clé publique pour créer un retrait).</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-warning">404</td>
                    <td className="p-4"><strong>Not Found</strong> - L'identifiant (paiement, lien) n'existe pas.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-warning">409</td>
                    <td className="p-4"><strong>Conflict</strong> - Erreur d'idempotence. Cette clé d'idempotence a déjà été utilisée avec des paramètres différents.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-error">429</td>
                    <td className="p-4"><strong>Too Many Requests</strong> - Vous avez dépassé la limite de requêtes par seconde de votre compte. Mettez en place une logique de backoff (réessais espacés).</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono-code font-bold text-status-error">500+</td>
                    <td className="p-4"><strong>Server Error</strong> - Un problème interne est survenu chez nous ou chez notre fournisseur (MonCash). Réessayez plus tard.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold text-sm mb-3">Format de l'objet d'erreur</h4>
            <p className="text-sm text-text-secondary mb-4">Lorsqu'une erreur 4xx survient, un objet JSON détaillé est renvoyé. Nous recommandons d'utiliser le champ <code>message</code> pour vos logs internes, et d'afficher un message utilisateur générique ("Une erreur est survenue lors du paiement").</p>
            
            <CodeBlock 
              language="json"
              code={`{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_missing",
    "message": "Le champ 'amount' est requis.",
    "param": "amount"
  }
}`} 
            />
          </section>

        </main>
      </div>
    </div>
  );
}
