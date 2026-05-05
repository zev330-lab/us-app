# Decisions: Positioning, Pricing, Domain

> Decided 2026-05-05. Made by Claude per Zev's "you have a good sense of this — make these decisions" directive. Reverse if/when Zev disagrees.

---

## TL;DR

| Decision | Pick |
|---|---|
| **Positioning** | "Know how your partner feels — without asking." |
| **Pricing** | Hybrid: Free → $4.99/mo or $29.99/yr (Together) → $79 lifetime. One partner pays, both unlock. 7-day free trial. |
| **Domain** | Primary: `heyus.app`. Fallbacks: `usthe.app`, `loveus.app`, `getus.app`. |

---

## Positioning: "Know how your partner feels — without asking."

### The decision

- **App Store subtitle (30 chars):** *"How your partner feels. Live."*
- **App Store promotional text:** "A real-time emotional dashboard for couples. Slide. See each other. Know when to talk, when to text, when to just be."
- **Marketing site H1:** *"Know how your partner feels — without asking."*
- **In-app tagline (under "Us" logo):** *"Just the two of you."*

### Frameworks applied

**JTBD (Jobs-to-be-Done):** the killer job is "skip the question 'how are you?'" — both partners hate the chore-question, the slider replaces it with a glanceable signal. The tagline names the job directly.

**Category claim:** Us is **not** therapy (Lasting, Talkspace), **not** prompts/games (Paired), **not** memory-keeping (Between), **not** location (Lookus). It's a new category — *ambient emotional awareness for couples*. Closest analogy: Find My Friends + Slack status, but emotional. The tagline implies this without saying it.

**Mimetic check:** I scanned how Paired ("the app that brings couples closer"), Lasting (therapy framing), Between ("memory keeping") position themselves. Every relationship app uses the same vague "deeper connection" promise. Picking a benefit-led, mechanism-implying line *differentiates*. "Without asking" is the unique part — competitors can't claim it.

**Indie B2C App Store reality:** functional taglines convert better than emotional ones in App Store search. The line includes "partner" + "feels" — both keywords couples search for.

**Why this beat the other two finalists:**
- "A dashboard for the two of you. No advice. Just presence." — too abstract, no benefit, makes it sound like a feature rather than a product.
- "Us is where you check in on each other." — "check in" is corporate-speak; loses the emotional intimacy.

### What this commits us to

- App copy must reinforce "passive intimacy" — no "tap to engage your partner" language, no quizzes, no prompts. The product is *glanceable*.
- Onboarding must make the "no asking" benefit visible in the first 30 seconds.
- We don't compete on "deeper connection" or "expert-led" content. Don't add a coach, don't add courses, don't add quizzes.

---

## Pricing: Hybrid (subscription lead, lifetime fallback)

### The decision

| Tier | Price | What's in it |
|---|---|---|
| **Free** | — | Slider + partner visibility + couple score + together/apart toggle + 24h history + 1 suggestion |
| **Together (monthly)** | $4.99/mo | Everything below |
| **Together (annual)** | $29.99/yr (50% off monthly equivalent) | Full suggestions deck, comm mode, push notifications, full history, customization |
| **Together Lifetime** | $79 one-time | Same as Together, forever, supports indie dev framing |

- **One partner pays → both unlock.** Subscription bound to `coupleId`, not user.
- **7-day free trial** of Together on signup. Industry default for this category.
- Lifetime priced at **2.6x annual** (within RevenueCat's 2.5-4x guideline).

### Frameworks applied

**Competitive landscape (from research):**

| App | Model | Price |
|---|---|---|
| Lasting | Subscription | $39.99/mo (therapy-adjacent, premium) |
| Paired | Subscription | ~$15/mo |
| Between | Hybrid | $13.99/yr or $26.99 lifetime (low-end, retention play) |
| CustodyLog (yours) | One-time IAP | $9.99 (acute-pain, one-shot use) |

**Sweet spot:** Below Paired's $15/mo (we're a slider, not therapy — must price like utility, not service). Above Between's $13.99/yr (we offer real-time + push, more value than memory storage).

**Why subscription-led, not pure-CustodyLog model:**
- CustodyLog's user is in an acute-pain situation with a one-time deliverable (PDF for attorney). Pay once, get the artifact, done. That's why $9.99 lifetime works.
- Us is a daily relationship-maintenance touchpoint. Recurring use justifies recurring revenue. Subscription compounds: $4.99/mo × 24 months = $120, vs. $9.99 once. The product *is* a relationship; the pricing should be too.

**Why include lifetime anyway:**
- 2026 subscription fatigue is real (search results show this trend).
- Lifetime captures the segment that rejects subscriptions on principle (~6% growth segment).
- Hybrid models grow revenue 20-40% by capturing different psychographics.
- Lifetime is *also* viral — "we got the couples lifetime plan" is share-worthy in a way "we have a subscription" isn't.

**Why one-pays-couple-unlocks (not both-pay):**
- Couples products with both-pay friction die at signup.
- The norm in this category (Lasting, Paired, Relish, Between) is solo-pay-shared-unlock.
- Bind subscription to `coupleId` server-side. Frontend reads `couples/{cid}/subscription.status`.

**Why 7-day trial (not 14, not 0):**
- 7 days is App Store standard, RevenueCat default, and gives both partners time to install + try.
- 14 days has higher cancel rate before charge.
- No trial = lower conversion in this category.

### What this commits us to

- Phase 3 (web) builds Stripe Checkout with these three SKUs.
- Phase 4 (native) builds RevenueCat with matching SKUs (StoreKit/Google Play).
- Free tier must be useful enough that both partners actually install (network effect drives premium conversion later).
- Pricing is testable; if we're at $0 conversion at $4.99/mo after 30 paying-couple validation, drop to $3.99 or rethink the offer.

### Pricing alternatives I considered and rejected

| Alternative | Why rejected |
|---|---|
| Pure CustodyLog clone ($9.99 one-time) | Undermonetized for daily-use product; no recurring justification. |
| $14.99/mo (match Paired) | Too aggressive for a slider; therapy apps justify $15+, we don't. |
| Free with ads | Kills trust in an emotional product. |
| $59 lifetime only (no subscription) | Eliminates trial-to-sub conversion, your strongest path to revenue. |
| Couple-pays $9.99/mo (both pay) | Friction kills couples-app conversion; unprecedented in category. |

---

## Domain: `heyus.app` (primary)

### The decision

**Primary:** `heyus.app`
**Fallbacks (in order):** `usthe.app`, `loveus.app`, `getus.app`

### Availability check (2026-05-05)

DNS probe results (`dig +short`):
- `heyus.app` → no DNS records → **likely available**
- `usthe.app` → no DNS records → **likely available**
- `loveus.app` → no DNS records → **likely available**
- `getus.app` → resolves to Azure IP (could be parking; check WHOIS at registrar)
- `usapp.io`, `us-app.com`, `useus.com`, `withus.app`, `tryus.app`, `twoofus.app`, `justus.app`, `weus.app`, `onlyus.app`, `forus.app` → all taken

Verify at Namecheap/Porkbun before purchase — DNS-empty is a strong signal but not definitive.

### Why `heyus.app`

- **Brandable**: "Hey us" is the casual greeting a couple says to each other; it's the product talking back to them.
- **Speakable**: "I'll add it on hey-us-dot-app" — works in conversation. (Compare: "us-app-dot-io" — awkward.)
- **Typeable**: 9 chars, no hyphens, no numbers, no homophones.
- **.app TLD**: Google-owned, HTTPS-required by spec (good for trust + PWA install). `.com` would be ideal but couple-themed `.com` are exhausted.
- **Matches voice**: the app voice in CLAUDE.md is "warm, playful, supportive — like a thoughtful friend." `heyus` lands there. `getus` is too imperative; `usapp` is too literal.

### What this commits us to

- Phase 2 (public PWA) registers `heyus.app` (~$15/year on Namecheap, $20 on Google Domains).
- Email at `hello@heyus.app` for support and ToS contact.
- App Store name stays "Us" (clean, brandable). Domain is the website.
- Avoid trademark conflicts: search USPTO TESS for "us" relationship-app trademarks before App Store submission. (Likely fine — "Us" is too generic to trademark in this category.)

### Why I rejected the alternatives

- `getus.app` — too imperative, sounds transactional; might be parked but uncertain.
- `usapp.io` — taken, and `.io` is more dev-tool than B2C consumer.
- `us-app.com` — hyphens kill brand recall; also taken.
- `loveus.app` — over-promises ("love"); sounds desperate.
- `usthe.app` — odd word order; "us, the app" works in tagline but not URL.

---

## What unlocks now

With these decisions made, **Phase 0.5 (test infrastructure) starts immediately on next session**. No more Tier-3 blockers.

Phase order:
1. Phase 0.5 — Vitest + tests for score math, bucket boundaries, suggestion filtering (~2 days)
2. Phase 1 — Multi-tenant rework: kill `COUPLE_ID = "zev-irit"`, add signup, couple-pairing flow (~5-7 days)
3. Phase 2 — Register `heyus.app`, deploy to Vercel, ToS/Privacy, account deletion (~3-4 days)
4. Phase 3 — Stripe Checkout with 3 SKUs (Free / $4.99 mo / $29.99 yr / $79 lifetime), couple-shared entitlement (~3-5 days)
5. **Validation gate**: 10 paying couples in 30 days
6. Phase 4 — Expo native if gate hits (~14-21 days)
7. Phase 5 — App Store with 13+ rating (per 2026 Apple rating system update), submit with positioning + pricing intact

## Sources

- [9 Best Couples Apps in 2026: Honest Reviews & Comparison Guide](https://www.connectedcouples.app/blog/best-couples-apps-2026)
- [Lasting App Review 2025](https://www.choosingtherapy.com/lasting-app-review/) — Lasting at $39.99/mo
- [Paired pricing](https://couplesanalytics.com/en/science/paired-app-cost-what-you-really-pay) — Paired up to ~$15/mo
- [Between Plus pricing](https://help.between.us/hc/en-us/articles/360016496273-What-is-the-difference-between-a-subscription-and-a-Couple-Lifetime-Plan) — $26.99 lifetime, $13.99/yr
- [Apple App Store rating system 2026 update](https://capgo.app/blog/app-store-age-ratings-guide/) — new 13+/16+/18+ tiers, deadline Jan 31 2026
- [RevenueCat lifetime pricing guidance](https://www.revenuecat.com/blog/growth/lifetime-subscriptions/) — 2.5-4x annual rate
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Indie hybrid pricing growth data](https://www.indiehackers.com/post/subscriptions-vs-one-time-payments-a-developers-honest-take-f153e48960)
