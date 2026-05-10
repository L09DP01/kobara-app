const BAZIK_USER_ID = (process.env.BAZIK_USER_ID || '').trim();
const BAZIK_SECRET_KEY = (process.env.BAZIK_SECRET_KEY || '').trim();
const BAZIK_API_URL = (process.env.BAZIK_API_URL || 'https://api.bazik.io/v1').trim();

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export const BazikService = {
  /**
   * Obtient un token d'accès Bazik, avec mise en cache mémoire simple.
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && tokenExpiresAt > now + 60000) {
      return cachedToken;
    }

    if (!BAZIK_USER_ID || !BAZIK_SECRET_KEY) {
      throw new Error("Missing Bazik credentials in environment variables.");
    }

    // Adapté aux standards oauth2/token, typiquement POST /token
    const response = await fetch(`${BAZIK_API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: BAZIK_USER_ID,
        secretKey: BAZIK_SECRET_KEY,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bazik Auth Error:", errorText);
      throw new Error(`Failed to authenticate with Bazik: ${response.statusText}`);
    }

    const data = await response.json();
    cachedToken = data.access_token || data.token;
    // Assume 1 hour expiration if not provided
    const expiresIn = data.expires_in ? data.expires_in * 1000 : 3600 * 1000; 
    tokenExpiresAt = now + expiresIn;

    return cachedToken as string;
  },

  /**
   * Crée un paiement MonCash via Bazik
   */
  async createMoncashPayment(params: {
    amount: number;
    reference: string;
    description?: string;
  }) {
    const token = await this.getAccessToken();

    const response = await fetch(`${BAZIK_API_URL}/moncash/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gdes: params.amount,
        userID: BAZIK_USER_ID,
        referenceId: params.reference,
        description: params.description || "Paiement Kobara",
        successUrl: process.env.NEXT_PUBLIC_APP_URL, // Optional
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la création du paiement Bazik");
    }

    return await response.json(); // typically contains payment URL or ID
  },

  /**
   * Vérifie le statut d'un paiement existant
   */
  async verifyMoncashPayment(transactionId: string) {
    const token = await this.getAccessToken();

    const response = await fetch(`${BAZIK_API_URL}/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Erreur de vérification du paiement Bazik");
    }

    return await response.json();
  },

  /**
   * Effectue un retrait vers un portefeuille MonCash
   */
  async createWithdrawal(params: {
    amount: number;
    receiver: string; // Numéro de téléphone
    reference: string;
    description?: string;
  }) {
    const token = await this.getAccessToken();

    const response = await fetch(`${BAZIK_API_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        receiver: params.receiver,
        reference: params.reference,
        description: params.description || "Retrait Kobara",
        provider: "moncash",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la demande de retrait");
    }

    return await response.json();
  },

  /**
   * Récupère le solde du compte Bazik de Kobara
   */
  async getBalance() {
    const token = await this.getAccessToken();

    const response = await fetch(`${BAZIK_API_URL}/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du solde");
    }

    return await response.json();
  }
};
