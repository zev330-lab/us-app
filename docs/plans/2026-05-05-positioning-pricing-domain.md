# Decisions: Positioning, Pricing, Domain

> Decided 2026-05-05. Domain pick reversed once (Zev rejected `heyus.app`); pricing model revised once (Zev shifted from couple-shared to per-user).

---

## TL;DR

| Decision | Pick |
|---|---|
| **Positioning** | "Know how your partner feels — without asking." |
| **Pricing** | 7-day free trial → auto-renews to $9.99/year. Each partner subscribes individually. No monthly, no lifetime, no permanent free tier. |
| **Domain** | `twoof.us` — reads as "two of us" |

---

## Positioning: "Know how your partner feels — without asking."

(Unchanged from initial decision.)

- **App Store subtitle (30 chars):** *"How your partner feels. Live."*
- **App Store promotional text:** "A real-time emotional dashboard for couples. Slide. See each other. Know when to talk, when to text, when to just be."
- **Marketing site H1:** *"Know how your partner feels — without asking."*
- **In-app tagline (under "Us" logo):** *"Just the two of you."*

### Frameworks applied

**JTBD:** the killer job is "skip the question 'how are you?'" — both partners hate the chore-question, the slider replaces it with a glanceable signal. The tagline names the job directly.

**Category claim:** Us is **not** therapy (Lasting, Talkspace), **not** prompts/games (Paired), **not** memory-keeping (Between), **not** location (Lookus). It's a new category — *ambient emotional awareness for couples*. Closest analogy: Find My Friends + Slack status, but emotional. The tagline implies this without saying it.

**Mimetic check:** every relationship app uses the same vague "deeper connection" promise (Paired, Lasting). Picking a benefit-led, mechanism-implying line *differentiates*. "Without asking" is the unique part — competitors can't claim it.

**Indie B2C App Store reality:** functional taglines convert better than emotional ones in App Store search. The line includes "partner" + "feels" — both keywords couples search for.

### Why this beat the other two finalists

- "A dashboard for the two of you. No advice. Just presence." — too abstract, no benefit, makes it sound like a feature rather than a product.
- "Us is where you check in on each other." — "check in" is corporate-speak; loses the emotional intimacy.

### What this commits us to

- App copy must reinforce "passive intimacy" — no "tap to engage your partner" language, no quizzes, no prompts. The product is *glanceable*.
- Onboarding must make the "no asking" benefit visible in the first 30 seconds.
- We don't compete on "deeper connection" or "expert-led" content. Don't add a coach, don't add courses, don't add quizzes.

---

## Pricing: $9.99/year per user, 7-day trial, no free tier (revised 2026-05-05 by Zev)

### The decision

- **Trial:** 7 days free on signup. Card-on-file required (App Store / Stripe pattern).
- **Auto-renewal price:** **$9.99/year per user.**
- **Each partner subscribes individually.** Bound to Firebase Auth UID, not couple ID.
- **No monthly tier. No lifetime tier. No permanent free tier after trial.**
- **Subscription gates the UI per user**, not per couple. If your sub lapses, you see "Renew to reconnect"; your partner's experience is unaffected as long as theirs is active.

### Why this differs from my first proposal

My first proposal was hybrid (Free / $4.99 mo / $29.99 yr / $79 lifetime, one-pays-couple-unlocks). Zev revised to single SKU, per-user, $9.99/yr. The revision is the right call:

| My v1 | Zev's v2 (final) |
|---|---|
| 4 SKUs (free, monthly, annual, lifetime) | 1 SKU (annual) |
| Couple-bound entitlement (RevenueCat shared) | Per-user entitlement (standard) |
| Single payer — friction-free for couples | Two payers — but $9.99 is below pain threshold |
| Conventional couples-app pattern | Unconventional but operationally simpler |
| ~$30/yr revenue ceiling per couple | ~$20/yr revenue ceiling per couple, BUT removes the "engaged partner subsidizes the disengaged one" dynamic |

### Trade-offs accepted

**Pro:**
- $9.99/year is below the "do I really need this?" threshold for almost any English-speaking couple. Below the price of one date-night drink.
- Per-user billing is operationally simple. No couple-shared entitlement webhook gymnastics. Stripe customer per user, IAP transaction per user.
- Removes the "engaged partner pays for disengaged partner" subsidy — both have skin in the game.
- If both convert, **revenue per couple is $19.98/yr** — higher than the conventional one-pays-shared $14.99/yr typical in this category.
- Cancellation isn't catastrophic: if one partner lets it lapse, the other still works. Per-user gating means *your* subscription = *your* access.

**Con:**
- Conventional wisdom in couples apps says one-pays-both-unlock has higher conversion (Lasting, Paired, Between all do this). We're betting against the convention.
- Mitigation: $9.99/yr is so low it removes the friction the convention exists to avoid.
- Risk: trial-to-paid conversion drops if the "less engaged" partner doesn't convert. Watch this in Phase 3.

### Free tier behavior — explicit

**No persistent free tier.** After the 7-day trial, both partners must have active subscriptions to use the app. Lapsed user sees a "Renew" screen. The non-lapsed partner still sees their own slider but the partner-state card shows "[Name] hasn't renewed."

This is more aggressive than typical freemium. The bet: $9.99/yr is low enough to convert.

**Alternative we considered and rejected:** persistent free tier with paywalled features (notifications, suggestions, comm mode, history). Rejected because it adds gating logic complexity for marginal conversion benefit at this price point.

### Account linking flow

(Renamed from "couple pairing" to match Zev's terminology — same mechanic.)

1. **Signup**: standard email/password (or Apple/Google). Each partner signs up independently.
2. **Trial starts**: 7-day window begins on signup.
3. **Linking**: from Settings → "Link your partner." Creates a 6-character invite code, 24h expiry.
4. **Partner enters code**: from their account → Settings → "Enter partner code." Server links the two UIDs into a `couples/{cid}` record where `cid = sortedConcat(uidA, uidB)` or new UUID.
5. **Once linked**: both partners' sliders write to `couples/{cid}/partners/{uid}` and they see each other.
6. **Unlinking**: rare path; needed for breakups. Server keeps history but stops syncing.

**Edge case — pre-link state:** newly signed-up user with no partner linked → trial still runs, slider works, but partner card shows "Send a code to link your partner." App Review will test this.

### What this commits us to

- Phase 3 (Stripe Checkout) ships exactly one SKU: $9.99/yr with 7-day trial.
- Phase 4 (Expo native) does the same via App Store IAP / Google Play.
- Linking flow is Phase 1, *independent of payment*.
- Subscription state lives on `users/{uid}.subscription`, not on `couples/{cid}`.
- Backend rule: only check `users/{uid}.subscription.status === "active"` when gating that user's UI.

### Pricing alternatives I considered and rejected

| Alternative | Why rejected |
|---|---|
| Hybrid (my v1) | Zev simplified — one SKU is cleaner |
| $9.99/mo | 12x more expensive over 1yr — kills conversion at trial end |
| $29/yr | Above the impulse-buy threshold; conversion drops |
| Free tier + premium tier | Adds gating logic for marginal benefit at $9.99 price |
| Lifetime $59 one-time | Kills recurring revenue; the product is daily-use, justifies recurring |
| Couple shared at $14.99/yr | Operationally complex for similar revenue |

---

## Domain: `twoof.us`

### The decision

**Domain:** `twoof.us` — reads as "two of us"

### Why this beat `heyus.app` (initial pick, rejected by Zev)

- `heyus` was a casual greeting — "hey us" sounds like a tech startup pitch deck. `twoof.us` is the couple's actual self-reference.
- The TLD trick: `.us` literally completes the brand statement. The URL IS the brand.
- Cultural anchor: Beatles' "Two of Us" gives free recognition.
- App Store name stays "Us"; domain is the *expanded* brand. Two layers of identity: short brand ("Us") + memorable URL ("two of us").

### Confirmed available 2026-05-05 via WHOIS no-match

Backups (also confirmed available, in priority order):
1. `alongside.us` — "alongside us, always" (long, but tagline-y)
2. `stay.us` — short, warm, but slightly off-grammar
3. `twousapp.com` — bland but if .us TLD is not desired

### Availability check details (from sweep)

WHOIS reports both `.app` and `.com` for most "us"-related candidates as registered. The .us cTLD opens up wordplay because .us domains are often parked but not squatted aggressively. Sweep also surfaced these as TAKEN: `together.app`, `tether.app`, `feelus.app`, `seeus.app`, `theus.app`, `inus.app`, `twoofus.com`, `usapp.io`, `us-app.com`, `useus.com`, `weus.app`, plus most generic couples words (`duet.app`, `duo.app`, `tandem.app`, `coupled.app`, `closer.app`).

Special cases: `we.us` and `hi.us` are reserved by the .us registry (`*.us Reserve Account`) — not registerable normally.

### Costs and registration plan

- Register on Namecheap or Porkbun: $15-25/year for .us TLD
- Use Cloudflare for DNS (free tier)
- Email: `hello@twoof.us` via Cloudflare Email Routing → Gmail (free)
- WHOIS privacy: included on Namecheap; required for `.us` (which historically had public WHOIS)

### What this commits us to

- App Store name stays "Us"; marketing/website is "twoof.us" (the URL spells the relationship).
- Logo on the marketing site can play with the wordplay: "two of [Us]" with "Us" stylized.
- Domain registered before Phase 2 (public PWA migration).

---

## What unlocks now

All Tier-3 decisions made. **Phase 0.5 (test infrastructure) starts immediately.** No more Tier-3 blockers.

Phase order:
1. **Phase 0.5** — Vitest + tests for score math, bucket boundaries, suggestion filtering (~2 days)
2. **Phase 1** — Multi-tenant rework: kill `COUPLE_ID = "zev-irit"`, add signup, account-linking flow (~5-7 days)
3. **Phase 2** — Register `twoof.us`, deploy to Vercel, ToS/Privacy, account deletion (~3-4 days)
4. **Phase 3** — Stripe Checkout, single SKU $9.99/yr with 7-day trial, per-user subscription gating (~3-5 days)
5. **Validation gate**: 10 paying *individuals* (5 couples both-pay, or some mix) in 30 days
6. **Phase 4** — Expo native if gate hits (~14-21 days)
7. **Phase 5** — App Store with 13+ rating, IAP at $9.99/yr matching web price

## Sources

- [9 Best Couples Apps in 2026: Honest Reviews & Comparison Guide](https://www.connectedcouples.app/blog/best-couples-apps-2026)
- [Lasting App Review 2025](https://www.choosingtherapy.com/lasting-app-review/) — Lasting at $39.99/mo
- [Paired pricing](https://couplesanalytics.com/en/science/paired-app-cost-what-you-really-pay) — Paired up to ~$15/mo
- [Between Plus pricing](https://help.between.us/hc/en-us/articles/360016496273-What-is-the-difference-between-a-subscription-and-a-Couple-Lifetime-Plan) — $26.99 lifetime, $13.99/yr
- [Apple App Store rating system 2026 update](https://capgo.app/blog/app-store-age-ratings-guide/) — new 13+/16+/18+ tiers, deadline Jan 31 2026
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Indie hybrid pricing growth data](https://www.indiehackers.com/post/subscriptions-vs-one-time-payments-a-developers-honest-take-f153e48960)
