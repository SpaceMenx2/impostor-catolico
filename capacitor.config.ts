import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.catequesis.impostor',
  appName: 'Impostor de Catequesis',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a3a6b',
      showSpinner: false
    }
  }
};

export default config;
