import '../global.css'; // NativeWind v4 initialization
import React, { useEffect, useState, useRef } from 'react';
import { AppState, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useSegments, useRouter, useRootNavigationState } from 'expo-router';
import { AppProvider } from '@/providers/AppProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/useAuthStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hydrate, isLoading, hasSeenOnboarding, isAuthenticated, isMerchantProfileComplete } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  
  const [isUnlocked, setIsUnlocked] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Screen Capture & App Preview Hiding logic
    const protectScreen = async () => {
      const hidePreview = await SecureStore.getItemAsync('kobara_hide_preview');
      if (hidePreview === 'true') {
        await ScreenCapture.preventScreenCaptureAsync();
      } else {
        await ScreenCapture.allowScreenCaptureAsync();
      }
    };
    protectScreen();

    // App State logic for biometric locking
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (!(global as any).isAuthenticatingBiometrics) {
          checkBiometrics();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkBiometrics = async () => {
    if ((global as any).isAuthenticatingBiometrics) return;
    
    const bioEnabled = await SecureStore.getItemAsync('kobara_biometrics_enabled');
    if (bioEnabled === 'true') {
      setIsUnlocked(false);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        (global as any).isAuthenticatingBiometrics = true;
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Déverrouillez Kobara',
          fallbackLabel: 'Utiliser le code',
        });
        (global as any).isAuthenticatingBiometrics = false;
        if (result.success) {
          setIsUnlocked(true);
        } else {
          // Si l'utilisateur annule, on reste bloqué
          setIsUnlocked(false);
        }
      } else {
        setIsUnlocked(true); // Pas de bio dispo, on débloque
      }
    } else {
      setIsUnlocked(true);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        await hydrate();
        await checkBiometrics();
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
    if (!navigationState?.key) return; // Wait for navigation to be ready

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
  }, [isLoading, hasSeenOnboarding, isAuthenticated, segments, navigationState?.key]);

  if (isLoading) {
    return null; // Splash screen visible pendant le chargement
  }

  if (!isUnlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0F1C', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Kobara est verrouillé</Text>
        <TouchableOpacity 
          onPress={checkBiometrics}
          style={{ backgroundColor: '#F97316', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Déverrouiller</Text>
        </TouchableOpacity>
      </View>
    );
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
