/**
 * Kobara Mobile — Store d'Authentification
 * 
 * Zustand store avec persistance SecureStore.
 * Gère : session, tokens, profil marchand, onboarding.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import authService, { AuthUser, MerchantProfile, AuthError } from '@/services/auth';

interface AuthState {
  // État
  user: AuthUser | null;
  merchant: MerchantProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  isMerchantProfileComplete: boolean;

  // Actions
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Clés SecureStore
const KEYS = {
  ACCESS_TOKEN: 'kobara_access_token',
  REFRESH_TOKEN: 'kobara_refresh_token',
  USER_DATA: 'kobara_user_data',
  MERCHANT_DATA: 'kobara_merchant_data',
  HAS_SEEN_ONBOARDING: 'kobara_has_seen_onboarding',
  REMEMBER_EMAIL: 'kobara_remember_email',
} as const;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  merchant: null,
  isAuthenticated: false,
  isLoading: true,
  hasSeenOnboarding: false,
  isMerchantProfileComplete: false,

  loginWithCredentials: async (email: string, password: string) => {
    const response = await authService.login(email, password);

    // Stocker les tokens de façon sécurisée
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, response.accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, response.refreshToken);
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(response.user));
    
    if (response.merchant) {
      await SecureStore.setItemAsync(KEYS.MERCHANT_DATA, JSON.stringify(response.merchant));
    }

    set({
      user: response.user,
      merchant: response.merchant,
      isAuthenticated: true,
      isMerchantProfileComplete: response.merchantProfileComplete,
    });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.USER_DATA);
      await SecureStore.deleteItemAsync(KEYS.MERCHANT_DATA);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
    
    set({
      user: null,
      merchant: null,
      isAuthenticated: false,
      isMerchantProfileComplete: false,
    });
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      // Vérifier l'onboarding
      const seenOnboarding = await SecureStore.getItemAsync(KEYS.HAS_SEEN_ONBOARDING);
      if (seenOnboarding === 'true') {
        set({ hasSeenOnboarding: true });
      }

      // Vérifier la session existante
      const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      const userData = await SecureStore.getItemAsync(KEYS.USER_DATA);
      const merchantData = await SecureStore.getItemAsync(KEYS.MERCHANT_DATA);

      if (accessToken && userData) {
        const user = JSON.parse(userData) as AuthUser;
        const merchant = merchantData ? JSON.parse(merchantData) as MerchantProfile : null;
        const profileComplete = merchant ? !!(merchant.phone && merchant.category) : false;

        set({
          user,
          merchant,
          isAuthenticated: true,
          isMerchantProfileComplete: profileComplete,
        });

        // Tenter de rafraîchir le profil en arrière-plan (silencieux)
        try {
          const profile = await authService.getProfile(accessToken);
          const updatedProfileComplete = profile.merchant 
            ? !!(profile.merchant.phone && profile.merchant.category) 
            : false;

          set({
            user: profile.user,
            merchant: profile.merchant,
            isMerchantProfileComplete: updatedProfileComplete,
          });

          // Mettre à jour le cache local
          await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(profile.user));
          if (profile.merchant) {
            await SecureStore.setItemAsync(KEYS.MERCHANT_DATA, JSON.stringify(profile.merchant));
          }
        } catch (err: any) {
          if (err.code === 'UNAUTHORIZED') {
            // Le token est expiré, on tente un refresh
            try {
              await get().refreshSession();
              // Si le refresh réussit, le state est déjà mis à jour, et l'API interceptera le nouveau token
            } catch (refreshErr) {
              // Si le refresh échoue, l'utilisateur est déconnecté par refreshSession()
            }
          }
          // Si c'est une erreur réseau, on garde simplement les données en cache
        }
      }
    } catch (error) {
      console.error('Failed to hydrate auth state:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    try {
      await SecureStore.setItemAsync(KEYS.HAS_SEEN_ONBOARDING, 'true');
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  },

  refreshSession: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        await get().logout();
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken);
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken);
    } catch (error: any) {
      if (error.code === 'UNAUTHORIZED') {
        // Token invalide → déconnexion
        await get().logout();
      }
      throw error; // Rethrow so caller knows it failed (e.g. network error)
    }
  },
}));

// Helper pour récupérer l'email sauvegardé ("Se souvenir de moi")
export async function getSavedEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS.REMEMBER_EMAIL);
  } catch {
    return null;
  }
}

export async function saveEmail(email: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYS.REMEMBER_EMAIL, email);
  } catch {
    // Silencieux
  }
}

export async function clearSavedEmail(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEYS.REMEMBER_EMAIL);
  } catch {
    // Silencieux
  }
}
