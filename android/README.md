# OrbitPay Android — Build Guide

This directory is the Android wrapper for the OrbitPay Member Portal.
Built with Capacitor — same approach as iOS, so the same `dist/` web
bundle runs inside an Android WebView.

## One-time setup

### Prerequisites
- JDK 17+ (`brew install openjdk@17`)
- Android Studio Koala+ (2024.1.1 or newer): https://developer.android.com/studio
- Android SDK 34 (installed via Android Studio's SDK Manager)
- Gradle 8+ (comes with Android Studio)
- A Google Play Developer account ($25 one-time fee)

### Required secrets

```bash
export ANDROID_KEYSTORE_PATH="$HOME/.android/orbitpay.keystore"
export ANDROID_KEYSTORE_PASSWORD="your-store-password"
export ANDROID_KEYSTORE_ALIAS="orbitpay"
export ANDROID_KEYSTORE_ALIAS_PASSWORD="your-alias-password"
```

Generate the keystore once:
```bash
keytool -genkey -v \
  -keystore ~/.android/orbitpay.keystore \
  -alias orbitpay \
  -keyalg RSA -keysize 2048 -validity 10000
```

⚠️ **Never lose this keystore.** If you lose it you can never update
your app on the Play Store — Google will reject the new signing key.

## Build steps

```bash
# 1. From project root, build the web bundle
npm install
npm run build

# 2. Initialize Android project
npx cap add android

# 3. Sync the web bundle + plugins
npx cap sync android

# 4. Open in Android Studio
npx cap open android

# 5. In Android Studio:
#    - Build → Generate Signed Bundle / APK
#    - Choose Android App Bundle (.aab) for Play Store distribution
#    - Select your keystore, enter passwords
#    - Choose release build variant
#    - Output: android/app/build/outputs/bundle/release/app-release.aab

# 6. Upload .aab to Google Play Console
```

## AndroidManifest.xml additions

Located at `android/app/src/main/AndroidManifest.xml` after `cap add android`:

```xml
<!-- Required for biometric login -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />

<!-- Required for camera (QR payments, KYC) -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Required for location (branch finder, fraud detection) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Required for push notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## Google Play Console submission

1. https://play.google.com/console — create new app
2. App name: OrbitPay
3. Default language: English (United States)
4. App or Game: App
5. Free or Paid: Free
6. Declarations: complete the content rating, target audience, etc.
7. Store listing: upload screenshots, description, icon (512x512 PNG)
8. App signing: upload your .aab, Google manages the signing key
9. Release → Production → Create release → upload .aab

## Internal testing (Play Console)

1. Play Console → Testing → Internal testing → Create track
2. Upload the .aab
3. Add testers by email
4. Testers accept the invitation and install via Play Store

## Push notifications via Firebase Cloud Messaging

1. Create a Firebase project at https://console.firebase.google.com
2. Add an Android app with package name `com.orbitpay.creditunion`
3. Download `google-services.json`
4. Place it at `android/app/google-services.json`
5. Add to `android/build.gradle` (project-level):
   ```gradle
   classpath 'com.google.gms:google-services:4.4.1'
   ```
6. Add to `android/app/build.gradle` (app-level):
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

## Costs

| Item | Cost |
|------|------|
| Google Play Developer account | $25 one-time |
| Firebase (Spark plan) | Free up to ~10K MAU |
| Push notifications (FCM) | Free unlimited |
| **Total** | **$25** |

## Why Capacitor over React Native

- Same codebase as web and iOS
- Same plugins (biometric, push notifications, haptics) work across all 3
- Lighter footprint than React Native (no JS bridge)
- Easier to maintain — one team can ship all three platforms