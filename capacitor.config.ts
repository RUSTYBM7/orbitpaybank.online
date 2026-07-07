import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for OrbitPay Mobile.
 *
 * Build process:
 *   1. `npm run build`           — outputs to dist/
 *   2. `npx cap sync`            — copies dist/ into ios/ and android/
 *   3. `npx cap open ios`        — opens Xcode, build the .ipa
 *   4. `npx cap open android`    — opens Android Studio, build the .aab
 *
 * Note: the live Vercel site uses the same code at orbitpaybank.online.
 * The mobile apps wrap that site so member users get a native install
 * experience without maintaining a separate React Native codebase.
 */
const config: CapacitorConfig = {
  appId: 'com.orbitpay.creditunion',
  appName: 'OrbitPay',
  webDir: 'dist',
  bundledWebRuntime: false,

  // Server config — keep aligned with vercel.json
  server: {
    url: 'https://orbitpaybank.online',
    cleartext: false,
  },

  // iOS-specific
  ios: {
    contentInset: 'always',
    backgroundColor: '#0F1E4A',
    buildOptions: {
      // Xcode build settings (used when running `npx cap sync ios`)
      developmentTeam: process.env.APPLE_DEVELOPMENT_TEAM,
      signingStyle: 'automatic',
      iOSDeploymentTarget: '15.0',
    },
    // Allow navigation to all internal routes
    scheme: 'OrbitPay',
  },

  // Android-specific
  android: {
    backgroundColor: '#0F1E4A',
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD,
      signingType: 'APK',
      // minSdkVersion 24 (Android 7.0), targetSdkVersion 34 (Android 14)
    },
    allowMixedContent: false,
    captureInput: true,
  },

  // Native plugins OrbitPay uses
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0F1E4A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F1E4A',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    App: {
      buildOptions: {
        // App icon configuration
        ios: {
          iconBackgroundColor: '#0F1E4A',
        },
      },
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Haptics: {
      impactStyle: 'medium',
    },
  },
};

export default config;