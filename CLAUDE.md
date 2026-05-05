# Us — Couples Emotional State Dashboard

## What This Is
A real-time PWA where two partners each set a Thinking ↔ Feeling slider (always sums to 100%). The app shows both states live, calculates a couple-level net score, and suggests activities based on the combined emotional state. No therapy, no advice — just data and suggestions.

## Current State
Phase 1 MVP shipped 2026-03-19. Live at https://zev330-lab.github.io/us-app/. Hardcoded single-couple (zev-irit). Marketplace transformation plan in `docs/plans/2026-05-05-us-marketplace-plan.md`.

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
- **Network-first service worker** with push/notification event handlers — do NOT cache aggressively on GitHub Pages
- **Mobile-first** — design for 375px width, test there first
- **3-second interaction rule** — slider update must be instant, no extra taps
- All suggestions are activities, never therapy or behavioral advice
- Tone: warm, playful, supportive — like a thoughtful friend

## Recent Changes
- 2026-05-05: Positioning + pricing + domain decisions made (Zev delegated). Saved to `docs/plans/2026-05-05-positioning-pricing-domain.md`. Positioning: "Know how your partner feels — without asking." Pricing: Free / $4.99 mo / $29.99 yr / $79 lifetime, one pays both unlock. Domain: heyus.app (primary). Phase 0.5 (test infra) unblocked.
- 2026-05-05: Discovery audit + marketplace transformation plan saved to `docs/plans/2026-05-05-us-marketplace-plan.md`. Verified live app working (browser-tested, no errors). Firebase rules now source-controlled (`database.rules.json`, `firebase.json`, `.firebaserc`).
- 2026-03-19: Added red-dot indicator (`useUpdateDot.ts`) — pings header + partner card when partner moved while you were away.
- 2026-03-19: Added local notifications (partner state change, bucket shift, together/apart toggle). Bell icon in header to toggle. Uses browser Notification API + Firebase listeners (no push server needed).
- 2026-03-19: Phase 1 MVP shipped — slider, real-time sync, couple score, comm mode, suggestions, PWA, deployed to GitHub Pages.

## Source of Truth
- Next action queue: `docs/NEXT_ACTION.md`
- Marketplace plan: `docs/plans/2026-05-05-us-marketplace-plan.md`
- Vault entry: `~/command-center-vault/projects/us-app.md`

## Known Issues
- Hardcoded `COUPLE_ID = "zev-irit"` and `PARTNER_MAP` (2 emails only) — must be ripped out for marketplace; see Phase 1 in marketplace plan
- "Make love" suggestion in Deep Connection bucket → 17+ rating mandatory, may need rewrite for App Store
- History writes unbounded (one row per slider change) — fine for 2 users, needs TTL or aggregation at scale
- No tests yet — Phase 0.5 is to add Vitest + RTL before any feature work (TaskCompleted hook blocks task completion without tests)

## What's Next
See `docs/NEXT_ACTION.md`. Top of queue: 3 Tier-3 decisions (positioning, pricing, domain), then Phase 0.5 test infra, then Phase 1 multi-tenant rework.
