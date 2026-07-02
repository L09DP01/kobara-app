# Payments API

L'objet **Payment** représente une transaction de paiement initiée via Kobara.

Cette API permet de :

* créer une session de paiement (MonCash, NatCash, ou Kobara Checkout) ;
* générer une URL checkout hébergée ;
* suivre le statut d'un paiement ;
* recevoir les confirmations webhook ;
* synchroniser les transactions avec votre dashboard Kobara.

Toutes les transactions créées via cette API sont enregistrées dans la table :

```txt
payments
```

avec les colonnes :

* `kobara_reference`
* `MonCash_order_id`
* `MonCash_transaction_id`
* `amount`
* `fee_amount`
* `net_amount`
* `status`
* `provider`
* `payment_method`
* `metadata`
* `paid_at`

---

## Endpoint

```http
POST /api/v1/payments
```

Base URL :

```txt
https://api.kobara.app
```

Exemple :

```http
POST https://api.kobara.app/api/v1/payments
```

---

## Authentification

Cette route nécessite une **Secret API Key** Kobara.

```http
Authorization: Bearer kbr_sk_live_xxxxxxxxx
```

⚠️ Les clés secrètes doivent toujours rester côté serveur.

Ne jamais :

* exposer une Secret Key dans React ;
* exposer une clé dans le navigateur ;
* appeler l’API Kobara directement depuis le frontend.

---

## Idempotency Key

Pour éviter les doubles paiements causés par :

* un refresh navigateur ;
* une erreur réseau ;
* une reconnexion ;
* un retry automatique ;

envoyez toujours un header :

```http
Idempotency-Key
```

Exemple :

```http
Idempotency-Key: 8f3d4e2a-93c2-4c0f-bbe0-95ab31f6d712
```

Kobara retournera la même transaction si la requête a déjà été traitée.

---

## Créer un paiement

### Requête

```json
{
  "amount": 2500,
  "currency": "HTG",
  "provider": "kobara",
  "description": "Abonnement Premium (1 mois)",
  "customer": {
    "name": "Jean Exemple",
    "email": "jean@example.com",
    "phone": "50900000000"
  },
  "metadata": {
    "internal_order_id": "ORD-89457",
    "plan_tier": "premium"
  },
  "success_url": "https://monsite.com/success",
  "error_url": "https://monsite.com/error",
  "webhook_url": "https://monsite.com/webhooks/kobara"
}
```

---

## Champs de la requête

### `amount`

Montant du paiement.

```json
"amount": 2500
```

Type :

```txt
number
```

---

## `currency`

Devise utilisée.

Actuellement :

```txt
HTG
```

---

## `description`

Description visible dans :

* le dashboard ;
* les logs ;
* certaines interfaces checkout.

Exemple :

```json
"description": "Abonnement Premium"
```

---

## `customer`

Informations du payeur.

```json
{
  "name": "Jean Exemple",
  "email": "jean@example.com",
  "phone": "50900000000"
}
```

Ces données peuvent être enregistrées automatiquement dans :

```txt
customers
```

---

## `metadata`

Objet JSON libre permettant de stocker :

* IDs internes ;
* références commandes ;
* IDs utilisateurs ;
* plans ;
* tags ;
* informations métier.

```json
"metadata": {
  "internal_order_id": "ORD-89457",
  "plan_tier": "premium"
}
```

Stocké dans :

```txt
payments.metadata
```

---

## `provider`

Spécifie l'expérience de paiement que vous souhaitez offrir à votre client.

Valeurs acceptées :
* `"kobara"` **(Défaut, Recommandé)** : Utilise le *Kobara Checkout*. Le client est redirigé vers une page unifiée hébergée par Kobara où il peut choisir lui-même entre MonCash et NatCash.
* `"moncash"` : Redirige directement le client vers la page de paiement MonCash.
* `"natcash"` : Redirige le client vers la page d'instructions de transfert NatCash générée par Kobara.

Si le champ `provider` n'est pas spécifié, la valeur par défaut est `"kobara"`.

```json
"provider": "kobara"
```

---

## `success_url`

URL de redirection après paiement réussi.

```json
"success_url": "https://monsite.com/success"
```

---

## `error_url`

URL de redirection après :

* annulation ;
* expiration ;
* échec paiement.

```json
"error_url": "https://monsite.com/error"
```

---

## `webhook_url`

URL webhook utilisée pour recevoir les événements temps réel.

```json
"webhook_url": "https://monsite.com/webhooks/kobara"
```

---

## Réponse API

### Réponse 200 OK

```json
{
  "id": "4dd6a06c-cf68-42cf-91b5-2f3e92f5b861",
  "merchant_id": "f4db35f5-6a8e-4e2d-9155-95b05f1d8a91",
  "customer_id": "6dc9f8d7-f44e-43f9-b497-58bb5a1a5a31",
  "kobara_reference": "KBR-PAY-20260509-001",
  "amount": 2500,
  "fee_amount": 72.50,
  "net_amount": 2427.50,
  "currency": "HTG",
  "status": "pending",
  "provider": "kobara",
  "payment_method": "kobara",
  "checkout_url": "https://pay.kobara.app/c/KBR-PAY-20260509-001",
  "success_url": "https://monsite.com/success",
  "error_url": "https://monsite.com/error",
  "webhook_url": "https://monsite.com/webhooks/kobara",
  "metadata": {
    "internal_order_id": "ORD-89457",
    "plan_tier": "premium"
  },
  "created_at": "2026-05-09T16:22:11Z"
}
```

---


## Réponse paiement confirmé

```json
{
  "id": "4dd6a06c-cf68-42cf-91b5-2f3e92f5b861",
  "kobara_reference": "KBR-PAY-20260509-001",
  "status": "succeeded",
  "MonCash_transaction_id": "trx_987654321",
  "paid_at": "2026-05-09T16:30:44Z"
}
```

---

## Workflow complet

```txt
1. Votre backend crée le paiement (avec provider "kobara", "moncash" ou "natcash").
2. Kobara génère checkout_url.
3. Le frontend redirige le client.
4. Le client choisit MonCash ou NatCash (si provider = "kobara") ou paie directement.
5. Le provider confirme le paiement.
6. Kobara met à jour payments.status.
7. Kobara envoie le webhook.
8. Votre backend confirme la commande.
9. Le dashboard Kobara est mis à jour.
```

---

## Exemple Node.js

```js
const payment = await kobara.payments.create({
  amount: 2500,
  currency: "HTG",
  description: "Abonnement Premium",
  customer: {
    name: "Jean Exemple",
    email: "jean@example.com",
    phone: "50900000000"
  },
  metadata: {
    internal_order_id: "ORD-89457"
  },
  provider: "kobara",
  success_url: "https://monsite.com/success",
  error_url: "https://monsite.com/error",
  webhook_url: "https://monsite.com/webhooks/kobara"
});
```

---

## Exemple cURL

```bash
curl https://api.kobara.app/api/v1/payments \
  -X POST \
  -H "Authorization: Bearer kbr_sk_live_xxxxxxxxx" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 8f3d4e2a-93c2-4c0f-bbe0-95ab31f6d712" \
  -d '{
    "amount": 2500,
    "currency": "HTG",
    "description": "Abonnement Premium",
    "customer": {
      "name": "Jean Exemple",
      "email": "jean@example.com",
      "phone": "50900000000"
    },
    "metadata": {
      "internal_order_id": "ORD-89457"
    },
    "provider": "kobara",
    "success_url": "https://monsite.com/success",
    "error_url": "https://monsite.com/error",
    "webhook_url": "https://monsite.com/webhooks/kobara"
  }'
```

---

## Sécurité

## Obligatoire

✅ créer les paiements côté backend
✅ utiliser `.env`
✅ vérifier les webhooks
✅ logger les événements
✅ utiliser HTTPS
✅ utiliser `Idempotency-Key`

---

## Interdit

❌ exposer `kbr_sk_*` côté client
❌ appeler MonCash directement
❌ faire confiance uniquement à la redirection frontend
❌ stocker les secrets dans GitHub

---

