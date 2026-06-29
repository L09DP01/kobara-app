import '../global.css'; // NativeWind v4 initialization
import React, { useEffect } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { AppProvider } from '@/providers/AppProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/useAuthStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hydrate, isLoading, hasSeenOnboarding, isAuthenticated, isMerchantProfileComplete } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await hydrate();
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!hasSeenOnboarding && !inOnboardingGroup) {
      // Scénario 1 : Premier lancement → Onboarding
      router.replace('/(onboarding)');
    } else if (hasSeenOnboarding && !isAuthenticated && !inAuthGroup) {
      // Scénario 2 : Pas authentifié → Login
      router.replace('/(auth)/login');
    } else if (hasSeenOnboarding && isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      // Scénario 3 : Authentifié → Dashboard
      // TODO: Si !isMerchantProfileComplete → Complete Account Wizard
      router.replace('/(tabs)');
    }
  }, [isLoading, hasSeenOnboarding, isAuthenticated, segments]);

  if (isLoading) {
    return null; // Splash screen visible pendant le chargement
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
