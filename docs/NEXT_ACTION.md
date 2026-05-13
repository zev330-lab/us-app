# Us — Next Action

Last updated: 2026-05-05

## Status

Live and working. Single-couple PWA shipped at https://zev330-lab.github.io/us-app/. Verified Firebase auth + RTDB reads/writes operational this session — **not offline, no thaw needed**.

## Marketplace plan

Full transformation plan saved at `docs/plans/2026-05-05-us-marketplace-plan.md`. Recommends: PWA-first monetization → validation gate → native via Expo (not Capacitor).

## What shipped today (2026-05-05)

- `database.rules.json` + `firebase.json` + `.firebaserc` — Firebase rules now source-controlled
- Marketplace transformation plan (Phases 0.5 → 6, calendar estimates)
- Positioning/pricing/domain locked: `twoof.us` + $9.99/yr per user + "Know how your partner feels — without asking."
- **Phase 0.5 complete**: Vitest + RTL + jsdom installed; 29 tests passing covering score math, bucket boundaries, suggestion content, comm mode lookups, proximity nudges
- Extracted shared lib: `src/lib/scoring.ts` (was duplicated in 3 files), `src/lib/commMode.ts` (was inlined)
- Fixed bug: `coupleNet > 100` or `< -100` was falling through to "balanced" suggestions instead of matching the deep/space bucket
- App Review prep: rewrote "Make love" → "Be physical" and "Run a bath together" → "Take a long bath together"; added regex test that fails if banned sexual terms reappear

## Decisions made 2026-05-05 (locked)

Recorded in `docs/plans/2026-05-05-positioning-pricing-domain.md`.

1. **Positioning** — *"Know how your partner feels — without asking."*
2. **Pricing** — 7-day free trial → auto-renews to **$9.99/year per user**. Each partner subscribes individually. Single SKU, no free tier, no lifetime. Per-user UI gating.
3. **Domain** — `twoof.us` (Zev to register on Namecheap, ~$15-25/yr).
4. **Account linking** — invite-code flow. Independent of payment.

Phase 0.5 starts immediately.

## What's next (in order)

1. ✅ **Phase 0.5** — done 2026-05-05.
2. ✅ **Phase 1** — done 2026-05-05.
3. ✅ **Phase 2** — done 2026-05-12.
4. 🚧 **Phase 4 — Expo native port** — kickoff done 2026-05-12 (commit `b36e7fd`). Scaffolding + Firebase + AuthContext + Login + Signup screens shipped. Bundles cleanly via `npx expo export`. Remaining: Disclaimer, Pair, Dashboard (slider, partner card, couple score, comm mode, suggestions, unlinked banner), Settings, Terms, Privacy. Then RevenueCat IAP, Privacy Manifest, EAS Build, TestFlight submission. Realistic remaining work: ~3-5 days focused.
5. **Phase 5** — App Store submission. Pre-submission checklist: `docs/plans/2026-05-12-app-review-checklist.md`. Don't press Submit until every box is GREEN.

## Zev action items (do anytime, parallelizable with Claude's coding)

- **Register `twoof.us`** on Namecheap/Porkbun (~$15-25/yr). Needed for App Store metadata (privacy policy URL, support URL).
- **App Store name decision** — search the App Store for "Us"; if taken, pick "Us: For Couples" or "Us — Just the Two of You". Locks the bundle ID name.
- **Confirm Apple Developer team** — same as CustodyLog or new? Bundle ID will be `app.twoof.us` (or chosen variant).
- **Link the GitHub repo to a new Vercel project** when `twoof.us` is registered — Vercel auto-detects `vercel.json` and uses `npm run build:vercel`. Custom domain → `twoof.us`.

## Phase 2 deploy state (as of 2026-05-12)

- ✅ Phase 2 complete (commit `efb10b2`). Live at https://zev330-lab.github.io/us-app/.
- ✅ Legal pages live at `/terms` and `/privacy` — real content tailored to the app, hosted in-app
- ✅ Disclaimer onboarding gate enforces "not therapy" acceptance before Pair
- ✅ Settings screen at `/settings`: profile edit, notifications toggle, unlink partner, ToS/Privacy links, sign out, **delete account** (with password re-auth)
- ✅ Account-deletion cascade implemented (`src/services/account.ts`): removes partner subtree, leaves couple intact unless last member, deletes user doc + Firebase Auth user
- ✅ Vercel config ready (`vercel.json`, `npm run build:vercel`) — Zev to link the repo when ready
- ✅ GH Pages SPA fallback (`public/404.html`) so `/us-app/terms` direct nav works on current deploy
- ✅ Phase 4 Expo native plan saved: `docs/plans/2026-05-12-phase-4-expo-port-plan.md`
- ✅ Pre-submission App Review checklist saved: `docs/plans/2026-05-12-app-review-checklist.md`

## Known issues / risks

- **Solo-waiting state** doesn't exist yet — Phase 1 must add. App Review will test this.
- **"Make love" suggestion** in Deep Connection bucket → 17+ rating mandatory or rewrite for App Store.
- **History writes unbounded** — every slider change pushes a row. Fine for 2 users, will need TTL or aggregation at scale.
- No tests yet — TaskCompleted hook will block any task completion until Phase 0.5 lands.
