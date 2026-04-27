# 🛡️ ShieldHer — Frontend

### 🚀 Run the Prototype

To experience ShieldHer instantly without manual configuration, follow these steps:

#### 1. Via Expo Go (Fastest)
1. Install **Expo Go** from the [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779).
2. Open the following link on your mobile device:
   **[Launch ShieldHer Prototype](https://u.expo.dev/b99b6f0e-c27b-41d8-8966-e3a570506425?channel-name=production)**
3. Alternatively, you can view all build artifacts and APKs here:
   **[Build & APK Dashboard](https://expo.dev/accounts/shreya_singh4593/projects/shieldher/builds)**

#### 2. Local Development Setup
If you want to run the project in your terminal and generate your own local QR code:
```bash
npm install
npx expo start
```
*This will generate a QR code in your terminal which you can scan with the Expo Go app.*

---

### ⚠️ Testing Notes
- **Network**: Ensure your phone and laptop are on the same Wi-Fi if testing locally.
- **Backend**: The prototype currently connects to the production safety engine. 🛡️
- **Stability**: If the app fails to load, check your internet connection.

---

### Project Structure

```
app/
├── _layout.tsx          # Root layout with desktop frame
├── index.tsx            # Animated splash screen
├── wellness.tsx         # Wellness Hub modal
└── (tabs)/
    ├── _layout.tsx      # Custom glassmorphic tab bar
    ├── index.tsx        # Dashboard + Smart SOS
    ├── travel.tsx       # Travel Shield
    ├── cyber.tsx        # Cyber Shield
    └── growth.tsx       # Growth Hub
```

---

**ShieldHer © 2025. One platform. Three shields. Zero compromise.**
