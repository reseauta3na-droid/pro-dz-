import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.techdzpro.app',
  appName: 'Tech DZ Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
