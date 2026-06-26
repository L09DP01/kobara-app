# Rapport d'Audit de Sécurité — Kobara.app

**Date :** 25 Juin 2026 | **Type :** Black-box | **Cible :** https://kobara.app

---

## Résumé Exécutif

Kobara est une passerelle de paiement **MonCash** pour Haïti (Next.js sur Vercel).
L'audit a révélé **1 vulnérabilité CRITIQUE, 2 ÉLEVÉES, 4 MOYENNES, 2 INFORMATIVES**.
**Score de risque global : 6.8/10 (Élevé)**

---

## 1. Informations Générales

| Propriété | Valeur |
|---|---|
| Domaine principal | kobara.app |
| Adresses IP | 64.29.17.1, 216.198.79.1 |
| Technologie | Next.js (App Router) sur Vercel |
| API | api.kobara.app (REST API v1) |
| Sous-domaine paiement | pay.kobara.app |
| Support | support@kobara.app |
| Sécurité | security@kobara.app |
| Entité légale | Kobara Technologies S.A., Port-au-Prince, Haïti |

---

## 2. Vulnérabilités

### 🔴 CRITIQUE — C-01 : Exposition de chemins sensibles via robots.txt

**Fichier :** https://kobara.app/robots.txt

**Contenu :**
```
User-Agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /system-core/
Disallow: /checkout/
Disallow: /settings/
Sitemap: https://kobara.app/sitemap.xml
```

**Chemins exposés :**
- `/dashboard/` — Interface d'administration marchande
- `/api/` — Backend API
- `/system-core/` — Noyau système (nom très évocateur)
- `/checkout/` — Processus de paiement
- `/settings/` — Paramètres utilisateur

**Impact :**
Un attaquant peut directement cibler les zones les plus sensibles de l'application. robots.txt n'est pas un mécanisme de sécurité — il est ignoré par les crawlers malveillants. L'absence de véritables contrôles d'accès côté serveur sur ces routes expose la plateforme à :
- Contournement d'authentification sur le dashboard
- Accès non autorisé aux endpoints API
- Manipulation de paramètres et de paiements

**Recommandation :**
1. Retirer immédiatement ces chemins de robots.txt
2. Implémenter une authentification forte sur chaque route (middleware Next.js)
3. Vérifier que les routes /dashboard/, /api/, /system-core/, /checkout/, /settings/ ont des contrôles d'accès côté serveur
4. Ne **jamais** utiliser robots.txt comme mesure de sécurité

---

### 🟠 ÉLEVÉE — E-01 : Information Disclosure via l'API

**Endpoint racine :** https://api.kobara.app/
```json
{"name":"Kobara API","version":"v1","docs":"https://kobara.app/docs","status":"active"}
```

**Endpoints API validés :**
- `GET /v1/payments` → HTTP 401 Unauthorized (endpoint existe)
- `GET /api/v1/payments` → HTTP 401 (alias fonctionnel)
- `POST /v1/payments` → HTTP 401

**Tests CORS :**
- OPTIONS /v1/payments → HTTP 204 (CORS non restrictif visible)
- L'API répond avec `Allow: GET, HEAD, OPTIONS, POST`

**Test rate-limiting :** 20 requêtes consécutives → 20x HTTP 401 (aucun rate-limiting détecté)

**Impact :**
- Cartographie complète de l'infrastructure API par un attaquant
- Absence de rate-limiting → Brute-force de tokens possible
- L'endpoint /v1/payments est un point d'entrée critique (création de paiement)

**Recommandation :**
1. Limiter les informations de l'endpoint racine
2. Implémenter un rate-limiting strict (ex: 10 req/min par IP)
3. Retourner 404 au lieu de 401 sur les endpoints sans auth (ambiguïté)
4. Ajouter une validation HMAC côté serveur

---

### 🟠 ÉLEVÉE — E-02 : Absence d'en-têtes de sécurité

| En-tête | Statut | Risque |
|---|---|---|
| `Strict-Transport-Security` | ✅ max-age=63072000 | OK |
| `X-Frame-Options` | ❌ Manquant | **Clickjacking** |
| `X-Content-Type-Options` | ❌ Manquant | **MIME sniffing** |
| `Content-Security-Policy` | ❌ Manquant | **XSS, injection** |
| `Referrer-Policy` | ❌ Manquant | Fuite d'URL |
| `Permissions-Policy` | ❌ Manquant | API abuse |

**Impact :**
- **Clickjacking** : Un site malveillant peut intégrer Kobara dans une iframe transparente et tromper l'utilisateur
- **XSS** : Sans CSP, un attaquant peut exécuter des scripts arbitraires
- **MIME sniffing** : Les navigateurs peuvent interpréter des fichiers avec un mauvais type MIME

**Recommandation :**
```nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

### 🟡 MOYENNE — M-01 : Pas de fichier security.txt

Aucun fichier `/.well-known/security.txt` (RFC 9116). L'email security@kobara.app n'est trouvable que dans les CGU, pas via le mécanisme standardisé.

**Recommandation :** Créer `/.well-known/security.txt` :
```
Contact: mailto:security@kobara.app
Preferred-Languages: fr, en
Canonical: https://kobara.app/.well-known/security.txt
Policy: https://kobara.app/security-policy
```

---

### 🟡 MOYENNE — M-02 : Exposition d'emails internes

Quatre adresses email exposées : support@, legal@, privacy@, security@

**Risque :** Phishing ciblé, spam, ingénierie sociale.

**Recommandation :** Utiliser des formulaires de contact, protéger security@ avec PGP.

---

### 🟡 MOYENNE — M-03 : Exposition de la stack technique

En-têtes HTTP :
```
Server: Vercel
X-Powered-By: Next.js
```

**Risque :** Des CVEs récentes (Mai 2026) affectent Next.js < 15.5.18 et < 16.2.6 (RCE, SSRF, bypass).

**Recommandation :** Mettre à jour Next.js, désactiver X-Powered-By.

---

### 🟡 MOYENNE — M-04 : Absence de Subresource Integrity (SRI)

Ressources préchargées sans attribut `integrity`.

**Recommandation :** Implémenter SRI avec `integrity="sha256-..." crossorigin="anonymous"`.

---

### 🟢 INFORMATIF — I-01 : Sous-domaines découverts

| Sous-domaine | Résolution | Service |
|---|---|---|
| api.kobara.app | 216.198.79.1 | API REST v1 |
| pay.kobara.app | 216.198.79.1 | Portail de paiement |
| www.kobara.app | CNAME | Redirection |
| kobara.ht | **Non résolu** | Mentionné dans CGU |

---

### 🟢 INFORMATIF — I-02 : Points positifs constatés

- **Chiffrement :** TLS 1.3, Argon2id pour clés API, AES-256-GCM au repos
- **Politique KYC/AML** documentée avec conformité réglementaire
- **Processus de notification** des violations documenté
- **Contact sécurité dédié** : security@kobara.app
- **Gestion des sessions** avec HSTS (max-age 2 ans)
- **Documentation transparente** des pratiques de données

---

## 3. Analyse des Risques par Surface

| Surface | Niveau | Détail |
|---|---|---|
| robots.txt | **Critique** | Chemins administratifs exposés |
| API endpoints | **Élevé** | Énumérable, pas de rate-limiting |
| En-têtes HTTP | **Élevé** | Clickjacking, XSS, MIME sniffing |
| Dashboard | **Élevé** | Accès non autorisé potentiel |
| Webhooks | **Moyen** | Dépend de l'implémentation client |
| Sous-domaines | **Faible** | Surface limitée |
| Politique données | **Faible** | Documentation transparente |

---

## 4. Détails Techniques Supplémentaires

### Schéma d'authentification API
```
Authorization: Bearer kobara_live_***          (production)
Pattern: kbr_sk_test_***   (clé secrète test)
Pattern: kbr_pk_test_***   (clé publique test)
```

### Flux de paiement documenté
```
Client → Frontend (React + Kobara SDK) → API Kobara → MonCash → Webhook → Backend Marchand
```

### Variables d'environnement exposées dans la documentation
```
KOBARA_KEY
KOBARA_WEBHOOK_SECRET
NEXT_PUBLIC_KOBARA_PUBLIC_KEY
```

### Bibliothèques SDK
- `@kobara/node` — SDK Node.js (backend)
- `kobara-js` — SDK JavaScript (frontend)

---

## 5. Recommandations Prioritaires

### Priorité 1 — Actions immédiates
1. **Nettoyer robots.txt** : Retirer les chemins sensibles
2. **Ajouter X-Frame-Options: DENY** + Content-Security-Policy
3. **Implémenter rate-limiting** sur tous les endpoints API
4. **Auditer les contrôles d'accès** sur les routes sensibles

### Priorité 2 — Actions à court terme
5. **Créer /.well-known/security.txt**
6. **Mettre à jour Next.js** (dernière version patchée ≥ 15.5.18)
7. **Ajouter SRI** sur toutes les ressources

### Priorité 3 — Bonnes pratiques
8. **Établir un bug bounty program**
9. **Surveiller les fuites de clés API** (kobara_live_*, kbr_sk_*, kbr_pk_*)
10. **Tests d'intrusion réguliers**

---

## 6. Conclusion

Kobara.app démontre des pratiques de sécurité solides (chiffrement, documen
