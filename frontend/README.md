# ShieldHer — Frontend

React Native mobile application built with Expo SDK 54 and TypeScript.

## Setup

```bash
npm install
npx expo start
```

## Project Structure

```
app/
├── _layout.tsx          # Root layout with desktop frame
├── index.tsx            # Animated splash screen (2 scenes)
├── wellness.tsx         # Wellness Hub modal
└── (tabs)/
    ├── _layout.tsx      # Custom glassmorphic tab bar
    ├── index.tsx        # Dashboard + Smart SOS
    ├── travel.tsx       # Travel Shield (dynamic safety engine)
    ├── cyber.tsx        # Cyber Shield (AI inbox scanner)
    └── growth.tsx       # Growth Hub (jobs + mentors)

src/
├── theme.ts             # Design tokens & color system
├── GlassCard.tsx        # Glassmorphism card component
├── PressableScale.tsx   # Haptic-feedback pressable
└── StatusBarFake.tsx    # Web-only status bar for desktop frame
```

## Build

See [BUILD_GUIDE.md](./BUILD_GUIDE.md) for Android APK/AAB build instructions.

## Design System

- **Theme**: Ultra-modern glassmorphism on obsidian (#0D0B14)
- **Accents**: Neon green (#00FF9C), Cyber blue (#00E5FF), Wellness coral (#FF758F), SOS red (#FF3B30)
- **Typography**: System fonts with precise weight/spacing hierarchy
- **Motion**: Spring-physics scale animations, looping pulse rings, slide-up modals
