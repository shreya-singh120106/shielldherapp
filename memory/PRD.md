# ShieldHer — Product Requirements Document

## Overview
ShieldHer is a high-fidelity, production-ready React Native (Expo) mobile UI prototype for a Series-A women's safety & empowerment platform. Three shields — Travel Safety, Cyber Shield, and Growth — wrapped around an AI wellness intelligence core.

## Tech Stack
- **Frontend:** Expo SDK 54, expo-router (file-based routing), react-native-reanimated, react-native-svg, expo-blur, expo-linear-gradient
- **Backend:** FastAPI + MongoDB (motor)
- **AI:** Claude Sonnet 4.5 via Anthropic API

## Design Language
- **Theme:** Ultra-modern glassmorphism on deep obsidian (#0D0B14)
- **Accents:** Safety-neon green (#00FF9C) · Cyber blue (#00E5FF) · Wellness coral (#FF758F) · SOS red (#FF3B30)
- **Imagery:** Abstract obsidian glow, coral wellness backdrop, dark-map overlay, real mentor headshot

## Screens
1. **Splash (2 scenes)** — Glowing ShieldHer logo + tagline → storytelling line → fade to Dashboard. Total ~5.2 s.
2. **Dashboard** — Fake 9:41 status bar, "Good morning Aarya" header, glassmorphic Wellness Score badge (72) top-right, massive pulsing Smart SOS button with triple expanding rings, three glass feature cards (Travel 87/100 · Cyber blocks · Growth 12 opps).
3. **Travel/Map** — Dark Mumbai map, "Offline Mode Active" pill with mesh dots, custom route pins, bottom-sheet with SVG gauge showing Safety Score 87, four factors list, "Start Guarded Trip" gradient CTA.
4. **Cyber/Inbox** — Stats bar (scanned/toxic/accuracy), 5 messages. "Mom" is clear. Unknown/toxic messages are blurred + tagged "Toxic — Hidden". Tap → calls `/api/ai/toxic-check` which uses Claude to classify & reveal reason + category.
5. **Growth/Opportunities** — Power Phase banner (Ovulation, Day 13), Google Product Design Lead card (94% match), Sarah Chen Mentor card with avatar + Power Phase Sync gradient pill + gradient Connect CTA.
6. **Wellness Hub (modal, slide-up)** — Coral organic backdrop, 220px SVG progress ring (72/100), Phase/Energy/Sleep metrics, two AI-generated insight cards from `/api/ai/wellness-insights`, cycle phase ribbon (Menst/Foll/Ovul/Lut).

## Navigation
- 4 bottom tabs (Home, Travel, Shield, Growth) in a custom glassmorphic bar
- Wellness NOT in the tab bar — accessed via the wellness badge in Dashboard header → presents as modal

## AI Integration
| Endpoint | Model | Purpose |
|---|---|---|
| `POST /api/ai/toxic-check` | claude-sonnet-4-5-20250929 | Classify message as safe/toxic with confidence, category & reason |
| `POST /api/ai/wellness-insights` | claude-sonnet-4-5-20250929 | Generate 2 actionable daily insights tied to wellness score + cycle phase |

Backend stores every call in MongoDB (`toxic_checks`, `wellness_insights`). All responses exclude `_id`.

## SOS Flow
Tap Smart SOS → modal with countdown from 5 → at 0 shows "Help is on the way" + 4 trusted contacts alerted. Cancel button resets. (Fake emergency flow for demo; no real calls dispatched.)

## Out of Scope (v1 prototype)
- Auth / onboarding account creation
- Real push notifications
- Real map SDK (mock image + overlay)
- Real BLE mesh
