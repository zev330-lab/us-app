# Us — Marketplace Transformation Plan

> From "personal app for Zev+Irit" → "App Store product for any couple."
> Author: Claude. Date: 2026-05-05. Status: DRAFT — needs Zev sign-off on Tier-3 items (positioning, pricing) before Phase 1 starts.

---

## Thaw confirmation (2026-05-05)

Verified live. App at `https://zev330-lab.github.io/us-app/` loads, auth persists, Firebase RTDB reads/writes succeed, no console errors. **Not offline.** Source-controlled rules added (`database.rules.json`, `firebase.json`, `.firebaserc`) so we can `firebase deploy --only database` if rules ever drift. No code changes needed for tonight's usage.

---

## Strategic recommendation up front

**Don't go native first. Go public PWA → web subscription → validate → native.**

The fastest path to "is this a real product" is a paid web PWA, not the App Store. Native port is 3-6 weeks of work that's wasted if the offer doesn't convert. Web lets us A/B price, change copy hourly, and skip Apple Review entirely until we have signal. Native then becomes a quality/distribution upgrade for a validated product, not a gamble.

**Single biggest risk:** the data model is hardcoded to one couple. Every other phase depends on fixing that first. ~5-7 days of careful refactor with the existing zev-irit couple migrated as "couple #1" of N.

---

## What changes vs. what stays

| Stays | Changes |
|---|---|
| Slider math, 5-bucket score model, Comm Mode tables, Suggestions content | Hardcoded `COUPLE_ID = "zev-irit"` and `PARTNER_MAP` email→id |
| Firebase RTDB as the realtime layer | `couples/zev-irit/...` schema → `couples/{cid}/...` with member-gated rules |
| React/Vite/TS/Tailwind | Add Firebase Auth signup; add couple-pairing flow; add invite codes |
| Network-first SW pattern | GitHub Pages → custom domain on Vercel (cleaner install UX, PWA needs root path) |
| Local browser notifications | Add web push via FCM (Phase 2), then native push (Phase 4) |
| | "Make love" / sexual suggestions need a 17+ gate or rewrite for App Store |

---

## Multi-tenant data model rework (Phase 1 core)

```
users/{uid}: {
  displayName, email,
  coupleId,                 // null until paired
  partnerSlot,              // "a" | "b" — replaces hardcoded "zev"/"irit"
  createdAt
}

couples/{coupleId}: {
  members: { {uid1}: true, {uid2}: true },   // gates rules
  createdAt,
  subscription: {                             // mirrored from RevenueCat/Stripe webhook
    status: "active" | "trial" | "free",
    expiresAt,
    payerUid
  },
  partners: {
    {uid}: { name, thinking, feeling, together, lastUpdated }
  },
  history: { {pushId}: { ... } }
}

inviteCodes/{CODE}: {
  coupleId, expiresAt, redeemed
}
```

Rules become member-gated:

```json
"couples": {
  "$cid": {
    ".read":  "auth != null && root.child('couples/' + $cid + '/members/' + auth.uid).val() === true",
    ".write": "auth != null && root.child('couples/' + $cid + '/members/' + auth.uid).val() === true"
  }
}
```

Migration for existing zev-irit couple: write a one-shot script that creates a new `couples/{newCid}` document with both your UIDs as members and copies state across. Old path stays read-only for archive.

## Couple pairing flow

Standard 6-char alphanumeric invite code, 24h expiry, single-use:

1. **Onboarding fork**: "Starting fresh" vs "My partner sent me a code"
2. **Fresh** → backend creates `couples/{cid}`, adds creator as member, generates code, shows "Send this to your partner: ABC123"
3. **Joining** → input field, on submit: look up code → mark redeemed → add user to `couples/{cid}/members` → copy displayName into `couples/{cid}/partners/{uid}`
4. **Lock state** if code expires unredeemed: creator can regenerate
5. **One couple per user**: existing membership blocks creation/join

UX detail: solo-waiting state (paid but partner hasn't joined) needs a graceful "waiting room" screen — App Review explicitly tests this.

## Subscription model — solo billing, shared unlock

**Recommendation: one person pays, both unlock.** The subscription is bound to `coupleId`, not `uid`. RevenueCat backend webhook → flip `couples/{cid}/subscription.status` → both members read the same flag client-side.

Why: couples products with both-pay friction die on conversion. Asking the more-engaged partner to subscribe and unlock for both is the standard pattern (Lasting, Paired, Relish all do this).

**Pricing tier I'd test (Tier 3 — your call):**
- **Free**: slider + couple score, last-7-days history only
- **Together** ($4.99/mo or $39.99/yr): full history, notifications, suggestions, comm mode
- One-time pricing alternative: $59 lifetime — converts better for niche relationship products that don't justify recurring

⚠️ **Decision needed from you before Phase 3**: monthly+annual vs lifetime, and the actual price points. I'd default monthly+annual unless you have a strong opinion.

## Privacy / legal

Required before any public launch:

- **Privacy Policy** — what's stored (slider values + timestamps), where (Firebase US), retention, deletion, no third-party sharing. Hosted on the same domain.
- **Terms of Service** — explicitly disclaim "not therapy / not medical advice"; cap liability; arbitration clause; age 17+.
- **Account deletion** — required by Apple guideline 5.1.1(v) since 2022. In-app button → backend deletes user + their couple if last member.
- **CCPA/GDPR data export** — user can request their data; not strictly required for App Store but cheap insurance.
- **Sensitive-personal-data handling** — emotional state is borderline; we should encrypt history at rest (Firebase RTDB doesn't natively; consider migration to Firestore for field-level rules + Cloud Functions for any analytics).
- **Not a HIPAA product** — disclaim explicitly. The line is: this measures self-reported feelings, doesn't diagnose, doesn't treat, doesn't store medical history.

ToS + Privacy Policy: ~1 day with a template (Termly or iubenda generators), 0.5 day to customize. Don't spend a lawyer's hourly rate on v1.

## Native port — recommendation: Expo, not Capacitor, after PWA validates

| Path | Speed | Polish | Push | Recommendation |
|---|---|---|---|---|
| Stay PWA | 0d | Mid | Web push only (FCM) | **Phase 2-3** — validate first |
| Capacitor wrap | 7-10d | Low (web view) | Native via plugin | ❌ skip — feels webby |
| Expo (React Native) | 14-21d | High | Native (Expo Notifications) | **Phase 4** — once PWA converts |
| Bare RN / SwiftUI | 30-60d | Highest | Native | ❌ overkill for Phase 1 launch |

Why Expo over Capacitor: Capacitor's web-view feel kills trust for an emotional product. Native React Native is +5-10 days vs Capacitor and gets us legitimate native push, widgets later, and an actually-good install experience. Expo's EAS Build/Submit is the path of least resistance to TestFlight.

Code reuse plan: monorepo with `packages/core` for the score math, suggestion buckets, comm mode tables (zero React deps); `apps/web` (Vite) and `apps/native` (Expo) consume them. UI components don't share — Tailwind → NativeWind is mostly drop-in but inputs/sliders are different primitives.

## Apple App Review risks (specific to this app)

1. **"Make love" + "Run a bath together" suggestions** in the Deep Connection bucket → near-certain 17+ rating; possibly outright rejection under Guideline 1.1.4 if reviewer is conservative. **Mitigation: rephrase to "Be physical" / "Take a long bath" + 17+ rating from day one. Don't fight this.**
2. **"Therapy" framing** — current spec is good (explicit "not therapy"). Reinforce in onboarding + ToS. App Review reads onboarding screens.
3. **Solo experience while waiting for partner** — reviewer will test "what happens if I sign up alone?" The waiting-room screen needs to feel intentional, not broken. Show couple-score = "Waiting for [partner name]", let them play with the slider.
4. **In-App Purchase requirement** — relationship-content unlocks via web payment is a 3.1.1 violation. Web flow is OK for non-content (e.g., "manage your account online"), but in-app unlock must use Apple IAP. RevenueCat handles this cleanly.
5. **Sign in with Apple** required by guideline 4.8 if we offer Google sign-in. Either offer SiwA, or stick with email/password only.

Plan: 2-3 review cycles realistic. Submit early in the phase, iterate.

## Positioning — DECISION NEEDED FROM YOU

I'd never ship UI without a one-liner. Three to react to:

1. **"A dashboard for the two of you. No advice. Just presence."** *(closest to your spec — earnest, anti-therapy)*
2. **"Know how your partner is feeling — without asking."** *(benefit-led, more punchy, sets up the slider as the hero)*
3. **"Us is where you check in on each other."** *(softer, brand-led, weakest IMO)*

My pick: **#2** for marketing/App Store; **#1** as the in-app tagline below the logo. Lock this before any public-facing UI work in Phase 2.

---

## Phased plan with calendar-day estimates

Estimates assume focused work, no client interruptions. Realistic given your client load: roughly 2x the calendar.

### Phase 0 — Current (DONE 2026-03-19)
Single-couple PWA shipped. Live on GitHub Pages. ~4 commits, working.

### Phase 0.5 — Test infrastructure & rules-as-code (2 days) ← do this first
- Add Vitest + React Testing Library (your global CLAUDE.md mandates tests)
- Cover: score math, bucket boundaries, suggestion filtering, slider conversion
- Source-control Firebase rules (already done today)
- Add `firebase deploy --only database` to a deploy script
- Why first: every later phase touches this code; tests prevent regression and the TaskCompleted hook will block completion without them.

### Phase 1 — Multi-tenant rework (5-7 days)
- Refactor `types/index.ts`, `AuthContext`, `usePartnerSync` to coupleId-aware (no more hardcoded `zev-irit` / `PARTNER_MAP`)
- Add Firebase email/password signup (in addition to login)
- Add couple-pairing flow: invite code generation + redemption screen
- Update RTDB rules for member-based gating
- Migration script: zev-irit couple → first record in new schema; old path archived
- **Done when:** I can sign up a 3rd account, pair it with a 4th, and they can't see your data
- Risk: data migration. Mitigate by writing the new schema in parallel and dual-writing for a day before cutover.

### Phase 2 — Public PWA + privacy/legal (3-4 days)
- Custom domain (e.g., `usapp.io`, `getus.app` — register, $12-30/year). Avoid github.io/us-app/ subpath; PWAs need root.
- Vercel deploy (replaces GitHub Pages — keeps it fast, gets us env vars + serverless functions)
- Privacy Policy + ToS pages (templated, customized)
- Account deletion flow (in-app + Cloud Function for cascade)
- "Not therapy" onboarding screen
- 17+ rewrite of suggestion copy
- Web push via FCM (browser-side; partner phone can be anywhere on web)
- **Done when:** anyone on the internet can sign up, pair, and use it

### Phase 3 — Web monetization (3-5 days)
- Stripe Checkout integration (couple subscription → updates Firebase via webhook)
- Free vs Together tiers wired in code (gating + paywall)
- Solo-pays-couple-unlocks logic
- Trial period (7 days)
- Cancel/manage flow (Stripe customer portal — saves us 2 days vs. building it)
- **Done when:** stripe transaction → both partners have premium for 30 days
- **Validation gate before Phase 4**: 10 paying couples in 30 days. If not, Phase 4 is wrong.

### Phase 4 — Native via Expo (14-21 days)
- Monorepo restructure: extract `packages/core` (pure logic, no React)
- Expo project init, NativeWind for styling
- Port screens: Login, Pairing, Dashboard, Slider, Suggestions, Comm Mode, Notifications
- Expo Notifications setup (push from Cloud Function on partner change)
- RevenueCat integration (couple entitlement bound to coupleId)
- Sign in with Apple (required if we offer Google)
- TestFlight beta — recruit 5 couples from Phase 3 customers
- **Done when:** TestFlight build runs end-to-end with IAP working

### Phase 5 — App Store launch (5-7 days, calendar — most is wait)
- Screenshots, App Store listing, age rating (17+), keywords
- Privacy nutrition labels (Apple's required disclosure of data collection)
- Submit for review (expect 1-2 rejections; allocate review-cycle time)
- Coordinate launch: Product Hunt, r/relationships, couples newsletters
- **Done when:** approved + live + first non-friend couple subscribes

### Phase 6 — Post-launch (ongoing)
- Analytics (PostHog, privacy-respecting)
- Couple retention cohort
- Suggestion content expansion (personalize by usage)
- Apple Watch complication / lock screen widget (deferred until traction)

---

## Total calendar

| Path | Optimistic | Realistic |
|---|---|---|
| Phases 0.5 → 3 (paid PWA, public) | 13-18 days | 4-6 weeks |
| Phases 0.5 → 5 (App Store live) | 32-46 days | 10-14 weeks |

Recommended cadence: ship Phase 3 first, **wait for the validation gate** (10 paying couples in 30 days). If the gate hits, Phase 4-5 is funded by web revenue. If not, the question is "is this a product or a tool?" and you've spent ~$0 to learn.

---

## Decisions blocking me

Before I can start Phase 0.5, three things need a yes/no from you:

1. **Positioning**: pick from the 3 above (or write your own). Locks in-app copy and App Store listing.
2. **Pricing structure**: monthly+annual subscription vs $59 lifetime. Affects RevenueCat config + Stripe setup.
3. **Domain name**: do you want me to research available domains and shortlist 5? Or do you already have one in mind?

Everything else, I'll keep moving on with my own judgement and surface decisions as they come up.
