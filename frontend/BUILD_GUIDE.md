# ShieldHer — Android Build Guide

Complete step-by-step guide for building ShieldHer as a standalone Android APK/AAB on Windows.

## Prerequisites

1. **Node.js 18+** — [Download](https://nodejs.org/)
2. **Expo Account** — [Sign up free](https://expo.dev/signup)
3. **EAS CLI** — Install globally:
   ```bash
   npm install -g eas-cli
   ```

## One-Time Setup

### Step 1: Login to EAS
```bash
eas login
```
Enter your Expo account email and password.

### Step 2: Initialize EAS Project (CRITICAL: RUN FROM FRONTEND FOLDER)
```bash
cd frontend
# If you get "wrong root" or "package.json missing" errors:
# 1. Ensure you are INSIDE the frontend folder
# 2. Run:
eas init
```
This will link the project correctly to the `frontend` folder as the root. when prompted to link the project, select the existing project or create a new one. **EAS will now see package.json at the root.**

### Step 3: Configure Build (already done)
The `eas.json` file is pre-configured with three build profiles:

| Profile | Output | Use Case |
|---------|--------|----------|
| `development` | Debug APK | Testing with dev tools |
| `preview` | Release APK | **Prototype testing** — install directly on phone |
| `production` | Signed AAB | **Play Store** submission |

## Building the APK (Alpha Testing)

### Quick Build
```bash
cd frontend
eas build --profile preview --platform android
```

**What happens:**
1. EAS uploads your project to Expo build servers
2. Builds a release-signed APK (~5-10 minutes)
3. Provides a download URL when complete

### Install on Your Phone
1. Open the download URL on your Android phone
2. Tap "Download" → "Install"
3. If prompted, enable "Install from unknown sources" for your browser
4. The app installs like any Play Store app — with your custom icon and splash screen

**Alternative**: Scan the QR code shown in terminal from your phone.

## Building the AAB (Play Store)

```bash
eas build --profile production --platform android
```

This generates a signed `.aab` file ready for Google Play Console upload.

### Play Store Submission
1. Create a [Google Play Developer account](https://play.google.com/console/) ($25 one-time fee)
2. Create a new app in Play Console
3. Upload the `.aab` file to the "Production" track
4. Fill in store listing, screenshots, privacy policy
5. Submit for review

## Environment Variables

For production builds, update the backend URL in `eas.json`:

```json
"env": {
  "EXPO_PUBLIC_BACKEND_URL": "https://your-deployed-backend.com"
}
```

For local development, create `frontend/.env`:
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

## Updating the App

### Bump Version
In `app.json`:
- `version`: User-facing version (e.g., "1.1.0")
- `android.versionCode`: Must increment for each Play Store upload (e.g., 2, 3, 4...)

### OTA Updates (No Rebuild Needed)
For JavaScript-only changes:
```bash
eas update --branch preview --message "Fix: travel shield scoring"
```
This pushes updates without rebuilding the APK.

## Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### Build fails with dependency errors
```bash
cd frontend
rm -rf node_modules
npm install
eas build --profile preview --platform android --clear-cache
```

### APK won't install on phone
- Enable "Install from unknown sources" in Android Settings → Security
- Or use `adb install shieldher.apk` via USB

### Large APK size
The preview APK includes all architectures. Production AAB is optimized per-device by Google Play.

## Build Profiles Summary

```
┌─────────────────────────────────────────────────┐
│  eas build --profile preview --platform android │
│  → Installable APK for prototype testing         │
│  → Direct download link + QR code               │
│  → ~50-80 MB                                    │
├─────────────────────────────────────────────────┤
│  eas build --profile production --platform android │
│  → Signed AAB for Play Store                    │
│  → Upload to Google Play Console                │
│  → ~20-40 MB per device (optimized)             │
└─────────────────────────────────────────────────┘
```
