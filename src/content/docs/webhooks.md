# Webhooks

Les **Webhooks** permettent à Kobara d’envoyer des événements en temps réel vers votre serveur.

Ils sont essentiels pour :

* confirmer un paiement ;
* mettre à jour une commande ;
* débloquer un abonnement ;
* envoyer une notification ;
* synchroniser votre système.

Les événements webhook sont enregistrés dans :

```txt
webhook_events
```

et les endpoints dans :

```txt
webhook_endpoints
```

---

## Fonctionnement

```txt
Client paie
↓
Kobara reçoit confirmation
↓
Kobara déclenche webhook
↓
Votre serveur reçoit événement
↓
Votre système met à jour la commande
```

---

## Endpoint webhook côté client

Exemple :

```txt
https://monsite.com/api/webhooks/kobara
```

Méthode :

```http
POST
```

---

## Headers envoyés

```http
Kobara-Signature
Kobara-Event
Kobara-Timestamp
Content-Type: application/json
```

---

## Vérification sécurité

Votre serveur doit toujours :

* vérifier `Kobara-Signature` ;
* vérifier le timestamp ;
* vérifier que la requête vient bien de Kobara.

⚠️ Ne jamais traiter un webhook sans validation signature.

---

## Exemple Header

```http
Kobara-Signature: t=1715264000,v1=2f8a...
Kobara-Event: payment.succeeded
```

---

## Payload webhook

```json
{
  "id": "evt_29dj39dk2",
  "type": "payment.succeeded",
  "created_at": "2026-05-09T18:55:00Z",
  "data": {
    "payment": {
      "id": "pay_92jd82",
      "kobara_reference": "KBR-PAY-20260509-001",
      "amount": 2500,
      "currency": "HTG",
      "status": "succeeded",
      "provider": "moncash"
    }
  }
}
```

> **Note :** Le champ `provider` dans le webhook indique le moyen de paiement utilisé par le client (`"moncash"` ou `"natcash"`), même si vous aviez spécifié `"kobara"` lors de la création du paiement.

---



## Vérification Signature (Node.js)

```js
import crypto from "crypto";

const signature = req.headers["kobara-signature"];
const payload = JSON.stringify(req.body);

const expected = crypto
  .createHmac("sha256", process.env.KOBARA_WEBHOOK_SECRET)
  .update(payload)
  .digest("hex");

if (signature !== expected) {
  throw new Error("Invalid webhook signature");
}
```

---

## Bonnes pratiques

## Obligatoire

✅ vérifier la signature
✅ répondre rapidement `200 OK`
✅ logger les événements
✅ utiliser HTTPS
✅ protéger le endpoint webhook

---

## Interdit

❌ traiter le webhook sans vérification
❌ exposer le webhook secret
❌ faire confiance uniquement au frontend
❌ ignorer les retries webhook

---

## Retries automatiques

Si votre serveur ne répond pas correctement :

```http
200 OK
```

Kobara réessaiera automatiquement l’envoi.

Les retries sont enregistrés dans :

```txt
webhook_events.retry_count
```

---

