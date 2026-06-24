# Deen Companion Mobile

Expo SDK 56 and Expo Router scaffold for the native Deen Companion app.

Requires Node.js 20.19.4 or newer.

## Setup

```bash
npm install
cp .env.example .env
npm run ios
```

Use `npm run android` or `npm run web` for other targets.

The mobile client consumes the existing Next.js API routes. Set
`EXPO_PUBLIC_API_URL` to a URL reachable from the simulator or device:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

On a physical device, use the computer's LAN address rather than `localhost`.

The native shell mirrors the five user-intent areas used by the PWA: Home,
Quran, Learn, Community, and Profile. The database, search, AI retrieval,
content review, and synchronization contracts remain shared with the web
platform.
