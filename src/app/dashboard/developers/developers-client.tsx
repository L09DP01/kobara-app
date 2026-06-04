'use client'

import { useState } from 'react';
import Link from 'next/link';
import { kobaraSdks } from '@/config/sdks';
import { docsLinks } from '@/config/docs-links';

const KOBARA_AI_PROMPT = `# Integrate Kobara Payments Into My Application

You are a senior software engineer specialized in fintech APIs, payment infrastructure, SaaS integrations and secure backend architecture.

Your mission is to integrate Kobara Payments into my existing application in a secure, scalable and production-ready way.

## IMPORTANT - READ DOCUMENTATION FIRST

Before analyzing my project or generating any code:

Visit and analyze the Kobara documentation:

https://kobara.app/docs/quickstart

Also analyze all relevant sections:

* javascriptSdk: \`https://kobara.app/docs/javascript-sdk\`,

    nodeSdk: \`https://kobara.app/docs/nodejs-sdk\`,

    pythonSdk: \`https://kobara.app/docs/python-sdk\`,

    phpSdk: \`https://kobara.app/docs/php-sdk\`,

    wordpressPlugin: \`https://kobara.app/docs/wordpress-plugin\`,

    aiIntegration: \`https://kobara.app/docs/ai-integration\`,

    payments: \`https://kobara.app/docs/payments\`,

    paymentLinks: \`https://kobara.app/docs/payment-links\`,

    webhooks: \`https://kobara.app/docs/webhooks\`,

    withdrawals: \`https://kobara.app/docs/withdrawals\`,

    errors: \`https://kobara.app/docs/errors\`,

  Use the documentation as the source of truth.

Do not invent:

* endpoints
* parameters
* request bodies
* response bodies
* webhook events
* SDK methods

If information is missing, say so explicitly.

---

## Step 1 - Analyze My Project

Before writing code:

* Detect the framework automatically.
* Detect frontend architecture.
* Detect backend architecture.
* Detect package manager.
* Detect database.
* Detect authentication.
* Detect existing payment systems.
* Detect environment variables.
* Detect deployment platform.
* Detect API routes.

Supported frameworks:

Frontend:

* Next.js
* React
* Vue
* Nuxt
* Angular

Backend:

* Express
* NestJS
* Fastify
* Laravel
* Symfony
* Django
* FastAPI
* Flask

Database:

* PostgreSQL
* MySQL
* MongoDB
* Supabase

---

## Step 2 - Choose The Correct Kobara SDK

JavaScript / React / Next.js

\`\`\`bash
npm install kobara-js
\`\`\`

Node.js / Express / NestJS

\`\`\`bash
npm install @kobara/node
\`\`\`

Python / FastAPI / Django

\`\`\`bash
pip install kobara
\`\`\`

PHP / Laravel / Symfony

\`\`\`bash
composer require kobara/php-sdk
\`\`\`

Use the SDK that best matches the detected stack.

---

## Step 3 - Integrate Kobara

Implement:

* Authentication
* Payments
* Payment Links
* Webhooks
* Withdrawals
* Error Handling

Follow the official Kobara documentation.

---

## Security Rules

Always:

* Use HTTPS.
* Use environment variables.
* Keep Secret Keys server-side.
* Verify webhook signatures.
* Validate input data.
* Follow OWASP best practices.

Public Key:

\`\`\`env
NEXT_PUBLIC_KOBARA_PUBLIC_KEY=
\`\`\`

Secret Key:

\`\`\`env
KOBARA_SECRET_KEY=
\`\`\`

Webhook Secret:

\`\`\`env
KOBARA_WEBHOOK_SECRET=
\`\`\`

Never expose secret keys to the frontend.

---

## Payment Flow

Customer
↓
My Application
↓
Kobara API
↓
Kobara Checkout
↓
Webhook
↓
Database Update
↓
Merchant Dashboard

Supported statuses:

* pending
* succeeded
* failed
* expired
* refunded

---

## Output Format

Always provide:

### Documentation Sections Used

### Detected Stack

### SDK Recommended

### Installation Commands

### Environment Variables

### Integration Plan

### Required Code Changes

### Full Code Examples

### Security Recommendations

### Potential Issues Found

---

Before modifying anything:

1. Explain what you found.
2. Explain what needs to change.
3. Explain why.
4. Then implement the integration.

The final result must be secure, scalable, production-ready and fully compatible with the official Kobara documentation.`;

export function DevelopersClient({ 
  merchant, 
  testPublicKey, 
  livePublicKey, 
  webhook, 
  usage, 
  subscription,
  isGuest = false,
}: { 
  merchant: any, 
  testPublicKey: string, 
  livePublicKey: string, 
  webhook: { configured: boolean, url: string | null }, 
  usage: any, 
  subscription: any,
  isGuest?: boolean,
}) {
  const [isTestMode, setIsTestMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'curl' | 'javascript' | 'python' | 'php'>('curl');

  const activeKey = isTestMode ? testPublicKey : livePublicKey;

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-12 pb-12">
      {/* Guest banner — shown when user is not logged in */}
      {isGuest && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
          <div>
            <p className="text-sm font-bold text-amber-800">Mode Sandbox — données génériques</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Connectez-vous pour voir vos vraies clés API et accéder à votre tableau de bord.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/login" className="px-5 py-2 rounded-lg bg-kobara-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
              Se connecter
            </Link>
            <Link href="/register" className="px-5 py-2 rounded-lg border border-amber-300 bg-white text-amber-800 text-sm font-bold hover:bg-amber-50 transition-colors">
              Créer un compte
            </Link>
          </div>
        </div>
      )}
      {/* 1. Header de page & Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Développeurs</h1>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-white/10">API v1</span>
            
            {/* Mode Switcher */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 ml-2">
              <button
                onClick={() => setIsTestMode(true)}
                className={`px-4 py-1.5 rounded-full text-label-caps font-label-caps tracking-wider transition-all duration-200 ${
                  isTestMode 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-white transparent border border-transparent'
                }`}
              >
                Test Mode
              </button>
              <button
                onClick={() => setIsTestMode(false)}
                className={`px-4 py-1.5 rounded-full text-label-caps font-label-caps tracking-wider transition-all duration-200 ${
                  !isTestMode 
                    ? 'bg-green-500/100/20 text-green-400 border border-green-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-white transparent border border-transparent'
                }`}
              >
                Live Mode
              </button>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl mt-4">
            Intégrez Kobara dans votre site, app ou boutique en quelques minutes. Vous utilisez actuellement les clés <strong className={isTestMode ? "text-amber-400" : "text-green-400"}>{isTestMode ? "Sandbox (Test)" : "Live (Production)"}</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={docsLinks.quickstart} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            Voir la documentation
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400">Clé publique ({isTestMode ? 'Test' : 'Live'})</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-sm font-bold text-white">{activeKey}</p>
            <button className="text-text-secondary hover:text-primary transition-colors" title="Copier" onClick={() => navigator.clipboard.writeText(activeKey)}>
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
            </button>
          </div>
          {!activeKey.includes('pk_') && (
            <Link href="/api-keys" className="mt-4 text-xs font-bold text-orange-400 hover:underline">Générer une clé</Link>
          )}
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400">Plan actuel</p>
          <div className="mt-2">
            <p className="text-xl font-bold text-white">{subscription.plan}</p>
            <p className="text-xs font-bold text-green-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
              {subscription.status}
            </p>
          </div>
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400">Appels API (Aujourd'hui)</p>
          <div className="mt-2">
            <p className="text-xl font-bold text-white">{usage.apiCallsToday}</p>
            <p className="text-xs text-text-secondary mt-1">{usage.paymentsThisMonth} paiements ce mois-ci</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400">Webhook Principal</p>
          <div className="mt-2">
            {webhook.configured ? (
              <>
                <p className="font-bold text-white truncate text-sm" title={webhook.url!}>{webhook.url}</p>
                <p className="text-xs font-bold text-green-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                  Configuré
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-text-secondary text-sm">Aucun webhook</p>
                <Link href="/webhooks" className="mt-4 text-xs font-bold text-orange-400 hover:underline">Configurer un webhook</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Plugin WordPress */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-8 shadow-sm ambient-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-[#21759b] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[28px]">web</span>
              </div>
              <h2 className="text-headline-lg text-xl font-bold text-white">Plugin WordPress Kobara</h2>
            </div>
            <p className="text-sm font-medium text-slate-400 mb-6">
              Acceptez les paiements MonCash sur WordPress et WooCommerce avec Kobara, sans exposer vos clés secrètes.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                <span className="material-symbols-outlined text-[14px] mr-1.5">verified</span>
                WordPress 6+
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                <span className="material-symbols-outlined text-[14px] mr-1.5">shopping_cart</span>
                WooCommerce Ready
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                <span className="material-symbols-outlined text-[14px] mr-1.5">toggle_on</span>
                Test / Live Mode
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="/downloads/kobara-wordpress-plugin.zip" download className="bg-primary text-on-primary px-6 py-3 rounded-lg font-body-base text-body-sm font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Plugin
              </a>
              <Link href={docsLinks.wordpressPlugin} className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors shadow-sm">
                Guide d'installation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SDK Installation */}
      <div>
        <h2 className="text-headline-md text-xl font-bold text-white mb-2">Installer les SDKs Kobara</h2>
        <p className="text-slate-400 text-sm mb-6">Ajoutez Kobara à votre frontend, backend ou application serveur en quelques minutes.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kobaraSdks.map((sdk) => (
            <div key={sdk.id} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-sm flex flex-col">
              <div className="p-5 border-b border-border-subtle bg-white/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-8 w-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">{sdk.icon}</span>
                  </div>
                  <span className="bg-surface-container-high text-text-secondary px-2 py-0.5 rounded text-[11px] font-mono-code">{sdk.version}</span>
                </div>
                <h3 className="text-[16px] font-bold text-white mt-3">{sdk.name}</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">{sdk.usage}</p>
              </div>
              <div className="p-5 bg-code-bg flex-1 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between bg-white/5 rounded-lg border border-white/10 p-2 overflow-hidden">
                  <code className="text-[12px] font-mono-code text-white/90 truncate ml-2">{sdk.installCommand}</code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(sdk.installCommand)}
                    className="text-white/50 hover:text-white p-1 rounded transition-colors flex-shrink-0" 
                    title="Copier"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
                <Link href={sdk.docsUrl} className="w-full text-center text-white/70 hover:text-white text-body-sm font-medium transition-colors">
                  Voir docs
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Integration Prompt */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-8 shadow-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[28px] text-white">auto_awesome</span>
                <h2 className="text-headline-lg font-headline-md text-white">Intégrer Kobara avec l'IA</h2>
              </div>
              <p className="text-body-base text-white/70 mb-8">
                Copiez ce prompt dans Cursor, Claude, GPT, Lovable ou Bolt pour intégrer Kobara automatiquement dans votre application.
              </p>
              
              <div className="bg-code-bg border border-white/10 rounded-xl p-5 mb-6 relative group">
                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar font-mono-code text-body-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                  {KOBARA_AI_PROMPT}
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => navigator.clipboard.writeText(KOBARA_AI_PROMPT)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-sm transition-colors border border-white/10"
                    title="Copier"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigator.clipboard.writeText(KOBARA_AI_PROMPT)}
                  className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  Copier prompt IA
                </button>
                <Link href={docsLinks.aiIntegration} className="bg-transparent text-white/70 hover:text-white px-4 py-2.5 rounded-lg font-body-base text-body-sm font-medium transition-colors flex items-center gap-1">
                  Voir docs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Playground */}
      <div>
        <h2 className="text-headline-md text-xl font-bold text-white mb-6">API Playground</h2>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-body-sm mb-2">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              API Endpoints
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-white font-medium">Créer un paiement</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white/5 text-green-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-white/10">POST</span>
              <h2 className="text-2xl font-bold text-white">/api/v1/payments</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Request Details */}
          <div className="space-y-8">
            <div className="bg-white/5 rounded-3xl border border-white/10 p-6 ambient-shadow">
              <h3 className="text-headline-md font-headline-md mb-6 text-white">Request</h3>
              
              <div className="flex gap-4 mb-6">
                <div className="w-32">
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-bold text-white focus:ring-orange-500 focus:border-orange-500 appearance-none">
                    <option>POST</option>
                  </select>
                </div>
                <div className="flex-1">
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-body-base font-mono-code focus:ring-primary focus:border-primary text-white" 
                    readOnly 
                    type="text" 
                    value={`${process.env.NEXT_PUBLIC_KOBARA_API_URL || 'https://api.kobara.app'}/api/v1/payments`}
                  />
                </div>
              </div>
              
              <div className="mb-6 space-y-2">
                <p className="text-body-sm font-medium text-white">Authorization</p>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <span className="text-text-secondary text-sm">Bearer</span>
                  <code className="text-sm font-mono-code text-white truncate flex-1">{isTestMode ? 'kbr_sk_test_...' : 'kbr_sk_live_...'}</code>
                </div>
              </div>
              
              <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-8 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Send Request
              </button>
              
              <div className="border-b border-border-subtle mb-6">
                <div className="flex gap-8 px-2">
                  <button className="pb-3 border-b-2 border-primary text-white font-medium text-body-sm">Body</button>
                  <button className="pb-3 border-b-2 border-transparent text-text-secondary font-medium text-body-sm hover:text-white">Headers</button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-code-bg rounded-lg p-4 font-mono-code text-[13px] text-white/90">
                  <pre>
                    {`{
  "amount": 1000,
  "currency": "HTG",
  "description": "Commande #1001",
  "customer": {
    "name": "Jean Exemple",
    "phone": "50900000000"
  },
  "successUrl": "https://site.com/success",
  "errorUrl": "https://site.com/error"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Response / Code */}
          <div className="bg-white/5 rounded-3xl border border-white/10 flex flex-col h-full ambient-shadow">
            <div className="flex border-b border-border-subtle bg-white/5 overflow-x-auto rounded-t-xl">
              <button onClick={() => setActiveTab('curl')} className={`px-6 py-3 text-center border-b-2 font-medium text-body-sm whitespace-nowrap transition-colors ${activeTab === 'curl' ? 'border-primary text-white bg-surface-container-low' : 'border-transparent text-text-secondary hover:bg-surface-container-low'}`}>cURL</button>
              <button onClick={() => setActiveTab('javascript')} className={`px-6 py-3 text-center border-b-2 font-medium text-body-sm whitespace-nowrap transition-colors ${activeTab === 'javascript' ? 'border-primary text-white bg-surface-container-low' : 'border-transparent text-text-secondary hover:bg-surface-container-low'}`}>JavaScript</button>
              <button onClick={() => setActiveTab('python')} className={`px-6 py-3 text-center border-b-2 font-medium text-body-sm whitespace-nowrap transition-colors ${activeTab === 'python' ? 'border-primary text-white bg-surface-container-low' : 'border-transparent text-text-secondary hover:bg-surface-container-low'}`}>Python</button>
              <button onClick={() => setActiveTab('php')} className={`px-6 py-3 text-center border-b-2 font-medium text-body-sm whitespace-nowrap transition-colors ${activeTab === 'php' ? 'border-primary text-white bg-surface-container-low' : 'border-transparent text-text-secondary hover:bg-surface-container-low'}`}>PHP</button>
            </div>
            
            <div className="p-4 bg-code-bg flex-1 rounded-b-xl overflow-y-auto relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-sm transition-colors border border-white/10 flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  Copy
                </button>
              </div>
              <pre className="text-[13px] font-mono-code text-white/90 leading-relaxed overflow-x-auto pt-2">
                {activeTab === 'curl' && (
                  <>
                    <span className="text-[#56b6c2]">curl</span> -X POST {process.env.NEXT_PUBLIC_KOBARA_API_URL || 'https://api.kobara.app'}/api/v1/payments \{'\n'}
                    {'  '}-H <span className="text-[#98c379]" >"Authorization: Bearer {isTestMode ? 'kbr_sk_test_xxx' : 'kbr_sk_live_xxx'}"</span> \{'\n'}
                    {'  '}-H <span className="text-[#98c379]" >"Content-Type: application/json"</span> \{'\n'}
                    {'  '}-d <span className="text-[#98c379]">'{'{'}
  "amount": 1000,
  "currency": "HTG",
  "description": "Commande #1001",
  "customer": {'{'}
    "name": "Jean Exemple",
    "phone": "50900000000"
  {'}'},
  "successUrl": "https://site.com/success",
  "errorUrl": "https://site.com/error"
{'}'}'</span>
                  </>
                )}
                {activeTab === 'javascript' && (
                  <>
                    <span className="text-[#c678dd]">const</span> <span className="text-[#e5c07b]">kobara</span> = <span className="text-[#61afef]">require</span>(<span className="text-[#98c379]">'@kobara/node'</span>)(<span className="text-[#98c379]">'{isTestMode ? 'kbr_sk_test_xxx' : 'kbr_sk_live_xxx'}'</span>);{'\n\n'}
                    <span className="text-[#c678dd]">const</span> <span className="text-[#e5c07b]">payment</span> = <span className="text-[#c678dd]">await</span> kobara.payments.<span className="text-[#61afef]">create</span>({'{'}{'\n'}
                    {'  '}amount: <span className="text-[#d19a66]">1000</span>,{'\n'}
                    {'  '}currency: <span className="text-[#98c379]">'HTG'</span>,{'\n'}
                    {'  '}description: <span className="text-[#98c379]">'Commande #1001'</span>,{'\n'}
                    {'  '}customer: {'{'}{'\n'}
                    {'    '}name: <span className="text-[#98c379]">'Jean Exemple'</span>,{'\n'}
                    {'    '}phone: <span className="text-[#98c379]">'50900000000'</span>{'\n'}
                    {'  '}{'}'},{'\n'}
                    {'  '}successUrl: <span className="text-[#98c379]">'https://site.com/success'</span>,{'\n'}
                    {'  '}errorUrl: <span className="text-[#98c379]">'https://site.com/error'</span>{'\n'}
                    {'}'});
                  </>
                )}
                {activeTab === 'python' && (
                  <>
                    <span className="text-[#c678dd]">import</span> kobara{'\n\n'}
                    kobara.api_key = <span className="text-[#98c379]">"{isTestMode ? 'kbr_sk_test_xxx' : 'kbr_sk_live_xxx'}"</span>{'\n\n'}
                    payment = kobara.Payment.<span className="text-[#61afef]">create</span>({'\n'}
                    {'  '}amount=<span className="text-[#d19a66]">1000</span>,{'\n'}
                    {'  '}currency=<span className="text-[#98c379]">"HTG"</span>,{'\n'}
                    {'  '}description=<span className="text-[#98c379]">"Commande #1001"</span>,{'\n'}
                    {'  '}customer={'{'}{'\n'}
                    {'    '}<span className="text-[#98c379]">"name"</span>: <span className="text-[#98c379]">"Jean Exemple"</span>,{'\n'}
                    {'    '}<span className="text-[#98c379]">"phone"</span>: <span className="text-[#98c379]">"50900000000"</span>{'\n'}
                    {'  '}{'}'},{'\n'}
                    {'  '}success_url=<span className="text-[#98c379]">"https://site.com/success"</span>,{'\n'}
                    {'  '}error_url=<span className="text-[#98c379]">"https://site.com/error"</span>{'\n'}
                    )
                  </>
                )}
                {activeTab === 'php' && (
                  <>
                    <span className="text-[#e5c07b]">$kobara</span> = <span className="text-[#c678dd]">new</span> \Kobara\Client(<span className="text-[#98c379]">'{isTestMode ? 'kbr_sk_test_xxx' : 'kbr_sk_live_xxx'}'</span>);{'\n\n'}
                    <span className="text-[#e5c07b]">$payment</span> = <span className="text-[#e5c07b]">$kobara</span><span className="text-[#56b6c2]">-&gt;</span>payments<span className="text-[#56b6c2]">-&gt;</span><span className="text-[#61afef]">create</span>([{'\n'}
                    {'  '}<span className="text-[#98c379]">'amount'</span> =&gt; <span className="text-[#d19a66]">1000</span>,{'\n'}
                    {'  '}<span className="text-[#98c379]">'currency'</span> =&gt; <span className="text-[#98c379]">'HTG'</span>,{'\n'}
                    {'  '}<span className="text-[#98c379]">'description'</span> =&gt; <span className="text-[#98c379]">'Commande #1001'</span>,{'\n'}
                    {'  '}<span className="text-[#98c379]">'customer'</span> =&gt; [{'\n'}
                    {'    '}<span className="text-[#98c379]">'name'</span> =&gt; <span className="text-[#98c379]">'Jean Exemple'</span>,{'\n'}
                    {'    '}<span className="text-[#98c379]">'phone'</span> =&gt; <span className="text-[#98c379]">'50900000000'</span>{'\n'}
                    {'  '}],{'\n'}
                    {'  '}<span className="text-[#98c379]">'successUrl'</span> =&gt; <span className="text-[#98c379]">'https://site.com/success'</span>,{'\n'}
                    {'  '}<span className="text-[#98c379]">'errorUrl'</span> =&gt; <span className="text-[#98c379]">'https://site.com/error'</span>{'\n'}
                    ]);
                  </>
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
