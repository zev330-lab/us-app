# Us — Next Action

Last updated: 2026-05-05

## Status

Live and working. Single-couple PWA shipped at https://zev330-lab.github.io/us-app/. Verified Firebase auth + RTDB reads/writes operational this session — **not offline, no thaw needed**.

## Marketplace plan

Full transformation plan saved at `docs/plans/2026-05-05-us-marketplace-plan.md`. Recommends: PWA-first monetization → validation gate → native via Expo (not Capacitor).

## What shipped today (2026-05-05)

- `database.rules.json` + `firebase.json` + `.firebaserc` — Firebase rules now source-controlled; deploy with `firebase deploy --only database` if rules ever drift
- Marketplace transformation plan (Phases 0.5 → 6, calendar estimates)
- Discovery audit: vault entry was 6 weeks stale, now corrected

## Decisions blocking Phase 0.5 (Zev's call)

1. **Positioning** — pick one of three (or write own):
   - "A dashboard for the two of you. No advice. Just presence."
   - "Know how your partner is feeling — without asking." *(my pick for marketing)*
   - "Us is where you check in on each other."
2. **Pricing structure** — monthly+annual subscription vs $59 lifetime
3. **Domain name** — register one before Phase 2 (Vercel deploy)

## What's next (in order)

1. **Phase 0.5** (~2 days) — Vitest + React Testing Library + tests for score math, bucket boundaries, suggestion filtering. Required by global CLAUDE.md TaskCompleted hook.
2. **Phase 1** (~5-7 days) — Multi-tenant data model rework. Strip hardcoded `COUPLE_ID = "zev-irit"` and `PARTNER_MAP`; add signup + couple-pairing flow.
3. **Phase 2** (~3-4 days) — Custom domain, Vercel migration, ToS/Privacy, account deletion, "not therapy" onboarding.
4. **Phase 3** (~3-5 days) — Stripe Checkout, free vs Together tier, couple-shared entitlement.
5. **Validation gate**: 10 paying couples in 30 days. If hit → Phase 4 (Expo native). If not → reassess.

## Known issues / risks

- **Solo-waiting state** doesn't exist yet — Phase 1 must add. App Review will test this.
- **"Make love" suggestion** in Deep Connection bucket → 17+ rating mandatory or rewrite for App Store.
- **History writes unbounded** — every slider change pushes a row. Fine for 2 users, will need TTL or aggregation at scale.
- No tests yet — TaskCompleted hook will block any task completion until Phase 0.5 lands.
