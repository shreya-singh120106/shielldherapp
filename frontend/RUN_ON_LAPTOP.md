# ShieldHer — Run as a Laptop App

ShieldHer is built with Expo + React Native Web, so it runs natively on your laptop in three ways:

## 1. As an installable Web App (PWA) — recommended, zero setup
Just open the deployed URL in **Chrome, Edge, or Safari**:
- Chrome / Edge → click the install icon ⊕ on the right of the address bar (or **⋮ menu → "Install ShieldHer"**)
- Safari → **File → Add to Dock**

The app gets its own icon, opens in its own window without browser chrome, and shows the desktop "phone-frame" experience automatically.

## 2. Run locally on your laptop (full source)
```bash
cd /app/frontend
yarn install        # only first time
yarn web            # opens http://localhost:8081 (or 19006)
```
Backend (FastAPI + MongoDB):
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```
Make sure `EXPO_PUBLIC_BACKEND_URL` in `frontend/.env` points to your backend URL (default: same host, `/api/*`).

## 3. Static export (for offline / hosting)
```bash
cd /app/frontend
npx expo export --platform web      # writes to dist/
# Serve dist/ with any static host, eg:
npx serve dist
```
The output in `dist/` is a fully self-contained PWA — drop it on Vercel / Netlify / S3 / your laptop's localhost.

## Layout behaviour
- **Viewport ≥ 820 px** (laptops, desktops): renders a marketing hero panel on the left and a realistic iPhone 15 Pro mockup on the right showcasing the live mobile UI.
- **Viewport < 820 px** (phones, tablets): renders edge-to-edge mobile UI exactly as on iOS / Android.

All interactivity (editable name, SOS countdown, AI toxic-check, search & filter, calendar cycle log, AI wellness insights) works identically across web, iOS, and Android builds.
