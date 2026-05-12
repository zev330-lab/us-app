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
- 2026-05-12: **Phase 2 done.** App Store readiness layer shipped. Legal pages at `/terms` and `/privacy` with full content (tailored to app — Firebase storage, $9.99/yr, 13+ floor, GDPR/CCPA, arbitration). Disclaimer onboarding gate enforces "not therapy / use with consent" acceptance before Pair screen. Settings screen with editable display name, notifications toggle, unlink partner (two-step confirm), ToS/Privacy links, sign out, and delete account (with password re-auth + cascading wipe of partner subtree + couple doc if last member). Lightweight URL router (`src/lib/router.ts`) supports both GH Pages (`/us-app/*`) and Vercel (`/*`) bases. Vercel config + `build:vercel` npm script ready. GH Pages SPA fallback via `public/404.html`. Phase 4 Expo plan saved at `docs/plans/2026-05-12-phase-4-expo-port-plan.md` with day-by-day breakdown. Pre-submission App Review checklist at `docs/plans/2026-05-12-app-review-checklist.md` — must be 100% green before any submission. Commit `efb10b2`.
- 2026-05-05: **Phase 1 done.** Multi-tenant data model: `users/{uid}` + `couples/{cid}` (member-gated by UID) + `inviteCodes/{code}`. New signup flow (`Auth.tsx` replaces `Login.tsx`). New pairing flow (`Pair.tsx`) with two paths: "send my partner a code" vs "I have a code." Invite codes 6-char alphanumeric, no ambiguous chars (lib/inviteCode.ts), 24h TTL, single-use, atomic redemption via Firebase transaction. `usePartnerSync` reworked for arbitrary `coupleId` + `uid`. `Dashboard` handles unlinked-couple state with inline invite-code banner. `AuthContext` auto-bootstraps user doc for legacy auth accounts. Stricter Firebase rules in `database.rules.json` — must be deployed via `firebase deploy --only database` after the code rolls out. Old `couples/zev-irit/` left as archive; Zev + Irit re-onboard after deploy (3-min cost). 39 tests still passing.
- 2026-05-05: **Phase 0.5 done.** Vitest + RTL + jsdom configured (`vite.config.ts` extended, `src/test/setup.ts`). 29 tests passing across `src/lib/scoring.test.ts`, `src/lib/commMode.test.ts`, `src/data/suggestions.test.ts`. Extracted `src/lib/scoring.ts` (Bucket type, `getCoupleNet`, `getBucket`, `BUCKET_LABELS`) — was duplicated in CoupleScore.tsx, useNotifications.ts, useSuggestions.ts. Extracted `src/lib/commMode.ts` (`getCommRec`, `getProximitySuggestion`, `getTogetherStatus`) — was inlined in CommMode.tsx. Fixed bug: `coupleNet > 100` or `< -100` fell through to "balanced" suggestion fallback instead of matching deep/space bucket. Rewrote "Make love" → "Be physical" and "Run a bath together" → "Take a long bath together" + added regex test guarding against sexual content (App Review 1.1.4 prep).
- 2026-05-05: Positioning + pricing + domain decisions locked. Saved to `docs/plans/2026-05-05-positioning-pricing-domain.md`. Positioning: "Know how your partner feels — without asking." Pricing: 7-day trial → $9.99/yr per user (single SKU, per-user gating, account linking independent of payment). Domain: `twoof.us`.
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
