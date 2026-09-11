import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omixdigital.decimal',
  appName: 'Decimal',
  webDir: '.next',
  server: {
    androidScheme: 'https',
    url: 'https://decimal-app.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#4F46E5',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
