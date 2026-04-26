# ShieldHer

**One platform. Three shields. Zero compromise.**

ShieldHer is an AI-powered women's safety & empowerment platform built with React Native. Three integrated shields — Travel Safety, Cyber Shield, and Career Growth — wrapped around a wellness intelligence core that adapts to your life.

## Features

### 🛡️ Smart SOS
- One-tap emergency alert with 5-second countdown
- Live location sharing with trusted contacts
- Nearest responder distance tracking

### 🗺️ Travel Shield
- Dynamic safety scoring engine (0–100) based on real-time location data
- Time-of-day aware risk assessment (lighting, crowd density, incidents)
- Smart route recommendations with safety tips
- 10+ city database with zone-level granularity

### 🔒 Cyber Shield
- AI-powered toxic message detection (Claude Sonnet)
- Real-time inbox scanning with 99.2% accuracy
- Harassment, phishing, stalking & scam classification
- Blurred preview with tap-to-reveal protection

### 💼 Growth Hub
- Cycle-phase-aware job matching ("Power Phase" sync)
- Global opportunity feed with smart filters
- Mentor matching with verified professionals

### 🌸 Wellness Intelligence
- Cycle tracking with phase-aware wellness scoring
- AI-generated daily insights (safety, cyber, career)
- Calendar-based cycle logging with score prediction

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo SDK 54), TypeScript, expo-router |
| UI | Glassmorphism, expo-blur, expo-linear-gradient, react-native-svg |
| Backend | FastAPI, MongoDB (motor), Python 3.8+ |
| AI | Claude Sonnet via Anthropic API |
| Build | Expo EAS Build (APK / AAB) |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Expo account (free at expo.dev)

### Frontend
```bash
cd frontend
npm install
npx expo start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Production Build (Android)
```bash
cd frontend
npx eas-cli build --profile preview --platform android   # APK
npx eas-cli build --profile production --platform android  # AAB
```

See [frontend/BUILD_GUIDE.md](frontend/BUILD_GUIDE.md) for detailed build instructions.

## Architecture

```
shielldherapp/
├── frontend/          # React Native (Expo) app
│   ├── app/           # File-based routing (expo-router)
│   │   ├── (tabs)/    # Tab screens (Dashboard, Travel, Cyber, Growth)
│   │   ├── index.tsx  # Splash screen
│   │   └── wellness.tsx # Wellness modal
│   ├── src/           # Shared components & theme
│   └── assets/        # Icons, splash, fonts
├── backend/           # FastAPI server
│   └── server.py      # API endpoints + AI integration
└── README.md
```

## License

Proprietary — ShieldHer © 2025. All rights reserved.
