import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kobara.app',
  appName: 'Kobara',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    url: 'https://kobara.app/mobile-onboarding',
    cleartext: true
  }
};

export default config;
