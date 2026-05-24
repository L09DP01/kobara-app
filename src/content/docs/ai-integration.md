# AI Integration

La section **AI Integration** permet aux développeurs d’utiliser des assistants IA comme :

* ChatGPT ;
* Claude ;
* Cursor ;
* Lovable ;
* Bolt ;
* Windsurf ;
* Copilot ;

afin d’intégrer Kobara automatiquement dans leur application en respectant :

* les bonnes pratiques sécurité ;
* l’architecture backend/frontend ;
* la gestion des webhooks ;
* la logique MonCash ;
* la gestion des paiements Kobara.

---

## Objectif

Le prompt IA doit permettre à une IA de :

✅ analyser automatiquement le projet client
✅ détecter la stack technique
✅ comprendre l’architecture existante
✅ intégrer Kobara proprement
✅ sécuriser les clés API
✅ configurer les webhooks
✅ créer les endpoints backend
✅ gérer les statuts paiement
✅ respecter la sécurité Kobara
✅ éviter les erreurs fréquentes

---

## Prompt AI recommandé

```txt id="kobara-ai-system-prompt"
Tu es un architecte logiciel senior spécialisé dans les infrastructures fintech, les APIs de paiement et les intégrations SaaS sécurisées.

Ta mission est d’intégrer Kobara Payments dans mon application existante de manière professionnelle, sécurisée et scalable.

IMPORTANT :
Avant de coder quoi que ce soit :
1. Analyse entièrement mon projet.
2. Détecte automatiquement ma stack technique.
3. Comprends l’architecture frontend/backend.
4. Analyse les routes existantes.
5. Analyse la structure de la base de données.
6. Analyse les systèmes d’authentification existants.
7. Vérifie les variables d’environnement.
8. Vérifie la gestion des paiements déjà existante.
9. Vérifie les middlewares sécurité.
10. Vérifie les endpoints API existants.

OBJECTIF :
Intégrer Kobara Payments correctement dans mon application sans casser l’architecture existante.

RÈGLES CRITIQUES :

1. Ne jamais exposer les clés secrètes Kobara côté client.
2. Toutes les requêtes sensibles doivent passer par le backend.
3. Toujours utiliser les variables .env.
4. Toujours utiliser HTTPS.
5. Vérifier les signatures webhook Kobara.
6. Utiliser uniquement les clés Kobara :
   - kbr_pk_* côté frontend
   - kbr_sk_* côté backend
7. Ne jamais communiquer directement avec MonCash ou MonCash.
8. Toute communication paiement doit passer uniquement par l’API Kobara.
9. Utiliser les bonnes pratiques OWASP.
10. Ajouter validation et gestion erreurs.

ARCHITECTURE RECOMMANDÉE :

Frontend
↓
Backend sécurisé
↓
API Kobara
↓
Infrastructure MonCash
↓
MonCash

TÂCHES À EFFECTUER :

1. Installer le SDK Kobara adapté à ma stack.
2. Configurer les variables d’environnement.
3. Créer les services Kobara backend.
4. Créer les endpoints API nécessaires.
5. Créer la logique de paiement.
6. Créer la logique des retraits.
7. Créer la logique des webhooks.
8. Créer la gestion des statuts paiement.
9. Ajouter les logs sécurité.
10. Ajouter la gestion erreurs.
11. Ajouter les protections anti-abus.
12. Ajouter la validation des données.
13. Ajouter les notifications temps réel.
14. Ajouter les analytics paiement.
15. Ajouter le mode Test et Live.

ANALYSE AUTOMATIQUE DEMANDÉE :

Détecte automatiquement :
- Next.js
- React
- Vue
- Laravel
- Express
- NestJS
- FastAPI
- Django
- Supabase
- PostgreSQL
- Prisma
- Tailwind
- TypeScript
- Docker
- Vercel

Puis adapte l’intégration Kobara à cette stack.

LOGIQUE DE PAIEMENT À IMPLÉMENTER :

1. Créer paiement :
POST /api/v1/payments

2. Retourner :
- checkout_url
- payment_id
- status

3. Rediriger le client vers Kobara Checkout.

4. Après paiement :
- recevoir webhook
- vérifier signature
- mettre à jour DB
- notifier frontend
- créditer dashboard marchand

STATUTS À GÉRER :

- pending
- succeeded
- failed
- expired
- refunded

WEBHOOKS :

Créer un endpoint webhook sécurisé.

Toujours :
- vérifier Kobara-Signature
- vérifier timestamp
- logger les événements
- éviter double traitement

ENV VARIABLES :

Frontend :
NEXT_PUBLIC_KOBARA_PUBLIC_KEY=

Backend :
KOBARA_SECRET_KEY=
KOBARA_WEBHOOK_SECRET=

BASE DE DONNÉES :

Créer ou adapter :
- payments
- customers
- payment_links
- withdrawals
- webhook_events
- audit_logs

GESTION FRONTEND :

Créer :
- checkout buttons
- payment success page
- payment failed page
- loading states
- error handling
- notifications

GESTION BACKEND :

Créer :
- services Kobara
- middleware auth
- rate limiting
- webhook verification
- retry logic
- logging

SÉCURITÉ :

Ajouter :
- validation Zod/Yup
- rate limiting
- CSRF protection
- secure headers
- anti replay webhook protection

QUALITÉ CODE :

- code propre
- TypeScript strict
- architecture scalable
- composants réutilisables
- services séparés
- aucune duplication

IMPORTANT :

Avant toute modification :
1. explique ce que tu vas modifier ;
2. explique pourquoi ;
3. explique les impacts ;
4. puis implémente proprement.

Si une architecture existante est mauvaise :
- explique pourquoi ;
- propose une meilleure solution ;
- puis migre proprement.

Le résultat final doit être :
- sécurisé ;
- scalable ;
- production-ready ;
- fintech-grade ;
- compatible Kobara ;
- optimisé pour MonCash.
```

---

## Ce que ce prompt permet

Ce prompt aide l’IA à :

* comprendre le projet ;
* éviter les erreurs sécurité ;
* détecter automatiquement la stack ;
* intégrer Kobara proprement ;
* éviter les mauvaises pratiques.

---

## Cas d’utilisation

Ce prompt peut être utilisé dans :

* Cursor
* Claude
* ChatGPT
* Bolt
* Lovable
* Windsurf
* GitHub Copilot

---

## Recommandation

Toujours :

1. fournir le code source ;
2. fournir `.env.example` ;
3. fournir la structure backend ;
4. fournir les routes API ;
5. fournir les modèles DB ;

afin que l’IA puisse :

* analyser correctement ;
* proposer une intégration propre ;
* éviter les conflits architecture.

---

## Important sécurité

⚠️ Même avec une IA :

Ne jamais :

* envoyer Secret Key au frontend ;
* hardcoder les secrets ;
* exposer les webhooks ;
* bypass Kobara API ;
* appeler MonCash directement.

---


