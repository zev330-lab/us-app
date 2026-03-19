# Us — Couples Emotional State Dashboard

## What This Is
A real-time PWA where two partners each set a Thinking ↔ Feeling slider (always sums to 100%). The app shows both states live, calculates a couple-level net score, and suggests activities based on the combined emotional state. No therapy, no advice — just data and suggestions.

## Current State
Phase 1 MVP — initial build. Nothing deployed yet.

## Tech Stack
- React 18 + Vite + TypeScript
- Tailwind CSS
- Firebase Auth (email/password for two users)
- Firebase Realtime Database (state sync)
- GitHub Pages deployment
- PWA (manifest + network-first service worker)

## Firebase Config
```
apiKey: "AIzaSyDZE2plhW9e2GPJsEwSjR6Bdra_H0PD2Ek"
authDomain: "us-app-4d572.firebaseapp.com"
databaseURL: "https://us-app-4d572-default-rtdb.firebaseio.com"
projectId: "us-app-4d572"
storageBucket: "us-app-4d572.firebasestorage.app"
messagingSenderId: "708596737937"
appId: "1:708596737937:web:664cd9b495c01696cb1c30"
measurementId: "G-LHH9ETWP7Z"
```

## User Accounts
- **Zev:** zev330@gmail.com → partnerId: "zev"
- **Irit:** iritfeldmanpsyd@gmail.com → partnerId: "irit"

## Firebase Data Structure
```json
{
  "couples": {
    "zev-irit": {
      "partners": {
        "zev": {
          "name": "Zev",
          "thinking": 10,
          "feeling": 90,
          "together": true,
          "lastUpdated": 1710000000000
        },
        "irit": {
          "name": "Irit",
          "thinking": 40,
          "feeling": 60,
          "together": true,
          "lastUpdated": 1710000000000
        }
      },
      "history": {}
    }
  }
}
```

## Working Rules
- Read this file at the start of every session
- Update this file after every significant change
- Conventional commit messages
- Never leave work in a broken state
- **Network-first no-op service worker** — do NOT cache aggressively on GitHub Pages
- **Mobile-first** — design for 375px width, test there first
- **3-second interaction rule** — slider update must be instant, no extra taps
- All suggestions are activities, never therapy or behavioral advice
- Tone: warm, playful, supportive — like a thoughtful friend

## Recent Changes
- 2026-03-19: Project launched. Phase 1 MVP build started.

## Known Issues
None yet — fresh build.

## What's Next
Phase 1 MVP: Slider + real-time sync + couple dashboard + suggestions + PWA deploy
