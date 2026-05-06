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
2. ✅ **Phase 1** — done 2026-05-05. Multi-tenant data model, signup flow, account linking via invite code, member-gated rules. Old `couples/zev-irit/` data preserved as archive (no migration); Zev + Irit re-onboard after deploy.
3. **Phase 2** (~3-4 days) — Register `twoof.us`, deploy to Vercel, ToS/Privacy, account deletion, "not therapy" onboarding screen.
4. **Phase 3** (~3-5 days) — Stripe Checkout, single SKU $9.99/yr with 7-day trial, per-user UI gating.
5. **Validation gate**: 10 paying users in 30 days. If hit → Phase 4 (Expo native). If not → reassess.

## ⚠️ Deploy ordering for Phase 1 (one-time)

The new code writes to a new schema (`users/{uid}`, `couples/{cid}`, `inviteCodes/{code}`). When this rolls out:

1. **Code goes live first.** GitHub Pages auto-deploys on push to main. Old (looser) rules accept the new writes temporarily.
2. **Then deploy stricter rules** via Firebase CLI: `firebase login && firebase deploy --only database` from `~/dev/us-app`. (Needs Zev's hands — Firebase login is interactive.)
3. **Re-onboard.** Zev + Irit each open the app, sign up fresh (or sign in to existing accounts — bootstrap will create user docs). One picks "I'll send my partner a code"; the other picks "My partner sent me a code." Linked. ~3 minutes.

## Known issues / risks

- **Solo-waiting state** doesn't exist yet — Phase 1 must add. App Review will test this.
- **"Make love" suggestion** in Deep Connection bucket → 17+ rating mandatory or rewrite for App Store.
- **History writes unbounded** — every slider change pushes a row. Fine for 2 users, will need TTL or aggregation at scale.
- No tests yet — TaskCompleted hook will block any task completion until Phase 0.5 lands.
