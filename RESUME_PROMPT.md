# Resume prompt — copy/paste after `/clear`

Paste this exactly into the new session:

---

I'm in `~/dev/us-app`. Read these three files in order, then tell me back: (1) where the project stands at end of last session, (2) exactly what we're working on right now, and (3) what the next concrete step is. Do not start coding — just confirm context.

1. `~/dev/us-app/CLAUDE.md` — project working rules + recent changes log
2. `~/dev/us-app/docs/NEXT_ACTION.md` — current queue, blockers, decisions
3. `~/command-center-vault/wiki/meta/session-2026-05-13-us-app-phase-2-and-4-kickoff.md` — full context of the last session (Phase 2 bug-hunt + Phase 4 Expo native kickoff)

After you've read those, also glance at:
- `~/dev/us-app/native/` — the Expo SDK 54 scaffold (login + signup screens ported, Firebase wired, bundles cleanly)
- `~/dev/us-app/docs/plans/2026-05-12-phase-4-expo-port-plan.md` — the day-by-day native port plan
- `~/dev/us-app/docs/plans/2026-05-12-app-review-checklist.md` — the pre-submission Apple guideline checklist

When you've confirmed context, hold for my go-ahead. Then continue Phase 4 by porting the next native screen — Disclaimer is the natural next one (it's the auth-state gate users hit right after signup, before Pair). Then Pair, Dashboard, Settings, Terms, Privacy. Then RevenueCat IAP, Privacy Manifest, EAS Build, TestFlight.
