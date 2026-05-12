# Phase 4 — Expo Native Port + RevenueCat IAP

> Plan only. Execute in a dedicated session. Estimated work: 14-21 days focused.

The goal: take the production-ready PWA from Phase 2 and ship it to the App Store as a native iOS app, with IAP for the $9.99/yr subscription, on the first review attempt.

The CustodyLog lesson: don't submit until every Apple guideline is verified, not just hoped-for. Every item on the App Review checklist (Phase 5 doc) gets a concrete validation step.

---

## Architecture

### Monorepo split

```
us-app/
  packages/
    core/                    # pure logic, zero React deps
      src/
        scoring.ts           # (moved from src/lib/scoring.ts)
        commMode.ts
        inviteCode.ts
        types.ts
      package.json
  apps/
    web/                     # current Vite/React PWA (renamed from root)
    native/                  # new Expo app
      app/
        (auth)/
          login.tsx
          signup.tsx
          disclaimer.tsx
        (main)/
          dashboard.tsx
          settings.tsx
          terms.tsx
          privacy.tsx
        pair.tsx
      services/
        coupling.ts          # ported from web
        account.ts           # ported from web
        revenuecat.ts        # new
        notifications.ts     # new (Expo push)
      hooks/
        usePartnerSync.ts    # adapted for RN
        useAuth.ts
      ...
      package.json
      app.json               # Expo config
      eas.json               # EAS build config
```

`packages/core` is the single source of truth for product logic. Web and native both consume it.

### Stack choices

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Expo (managed workflow, SDK ~52) | Same as CustodyLog — proven path |
| Routing | Expo Router (file-based) | Native to Expo; convention-driven |
| Styling | NativeWind | Tailwind classes on RN primitives; matches PWA |
| Auth | @react-native-firebase/auth | Native SDK, better than Web SDK on iOS |
| Database | @react-native-firebase/database | Same project (us-app-4d572) |
| IAP | RevenueCat (react-native-purchases) | Proven cross-platform; handles restore + entitlements |
| Push | expo-notifications | Native APNs token via Expo |
| Build | EAS Build (`eas build --platform ios`) | Standard for Expo apps |
| Submit | EAS Submit (`eas submit --platform ios`) | Skips manual Xcode/Transporter dance |

---

## Day-by-day breakdown

### Day 1 — Monorepo + core extraction

- Restructure: `apps/web` houses current code; create empty `apps/native`; create `packages/core` with the pure-logic files
- Update web imports to reference `@us-app/core`
- Verify web app still builds and all 40 tests pass
- Set up workspace with npm workspaces or pnpm

### Day 2-3 — Expo project bootstrap

- `npx create-expo-app@latest apps/native --template default`
- Add NativeWind, configure `tailwind.config.js` and `metro.config.js`
- Install: `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/database`, `react-native-purchases`, `expo-notifications`, `expo-router`, `lucide-react-native`
- Wire Firebase via `google-services.json` (Android) + `GoogleService-Info.plist` (iOS) — both downloadable from Firebase Console for project `us-app-4d572`
- App.json: bundle id `app.twoof.us` (or whatever) — register in Apple Developer Portal
- Verify "Hello World" Expo app boots in iOS Simulator

### Day 4-5 — Port screens 1 (Auth, Pair, Disclaimer)

- Auth.tsx → `app/(auth)/login.tsx` + `app/(auth)/signup.tsx`
- Pair.tsx → `app/pair.tsx`
- Disclaimer.tsx → `app/(auth)/disclaimer.tsx`
- Port useAuth.ts hook for RN Firebase auth (slightly different API)
- Port AuthContext to read from RN Firebase
- Sign in with Apple via `expo-apple-authentication` — REQUIRED if we offer any other social SSO; OPTIONAL for email-only. Decision: add it, because the App Store has been increasingly aggressive about pushing SiwA even on email-only apps.

### Day 6-7 — Port screens 2 (Dashboard, Settings, Legal)

- Dashboard.tsx with all sub-components: Slider, PartnerState, CoupleScore, StatusToggle, CommMode, Suggestions, UnlinkedBanner
- Settings.tsx with delete-account + unlink flows
- Terms/Privacy as native screens (same content, RN markup)
- Port usePartnerSync, useSuggestions, useNotifications, useUpdateDot
- RN slider primitive (`@react-native-community/slider`) replaces the web `<input type="range">`

### Day 8-9 — RevenueCat IAP integration

- Create RevenueCat account, configure App Store Connect app (placeholder)
- Set up product in App Store Connect: `us_annual_999` (auto-renewable subscription, 1-year duration, $9.99 price tier)
- Set 7-day intro free trial in App Store Connect
- Wire RevenueCat SDK: identify user by Firebase UID, present paywall, handle purchase
- Backend webhook (Firebase Cloud Function or RevenueCat → Firestore extension) flips `users/{uid}/subscription.status` = "active"
- **Restore Purchases button** (Apple Guideline 3.1.1 — REQUIRED) added to Settings
- Free trial UX: clearly show "Free for 7 days, then $9.99/year"
- Test sandbox subscription with a sandbox Apple ID

### Day 10-11 — Expo Notifications

- Replace web `Notification` API with `expo-notifications`
- Native APNs token registration via Expo push service
- On `usePartnerSync` partner-change, send push via expo-server-sdk (Cloud Function triggered by RTDB onUpdate)
- Handle notification permissions request (with explanation copy)
- Notification cooldown and threshold logic ported from `useNotifications.ts`

### Day 12 — Privacy nutrition labels + App Store Connect

- Fill out App Privacy disclosure in App Store Connect:
  - Contact info: email (Account Sign-In linked)
  - User content: none
  - Identifiers: User ID (Firebase UID) — linked to user, used for app functionality only
  - Usage data: none
  - Diagnostics: crash data only (Sentry/Crashlytics if added)
- Age rating questionnaire (target: **13+**, justified by Apple's 2026 system since the app has no objectionable content after our "Make love" → "Be physical" rewrite)
- App Store screenshots: 6.5" + 6.7" + 5.5" required. Use real-couple flow (Auth → Disclaimer → Pair → Dashboard linked). 5-7 screens.
- App preview video (optional but raises conversion ~12%)
- App listing copy: subtitle ("How your partner feels. Live."), promotional text, description, keywords (couples, relationship, emotions, dashboard, partner, connection)
- URLs: Support, Privacy Policy, ToS, Marketing
- Pre-fill review notes (see Phase 5 checklist)

### Day 13-14 — TestFlight + internal testing

- `eas build --profile production --platform ios`
- `eas submit --profile production --platform ios` to push to TestFlight
- Add Zev, Irit as internal testers
- Run full E2E: signup → disclaimer → pair → slider sync → notifications → upgrade (sandbox) → restore → delete account
- Fix anything that breaks; specifically watch for:
  - Subscription flow stalls
  - Missing Sign in with Apple
  - Push notifications not delivering
  - Account deletion on iOS rolling back

### Day 15-16 — External TestFlight beta

- Invite 5-10 real couples (~10-20 users) for 1 week of beta
- Collect feedback via TestFlight comments or in-app NPS
- Fix critical bugs only — don't scope-creep
- Watch for App Review-style issues (broken flows, dead screens, crashes)

### Day 17-19 — Polish + submission prep

- Apply beta feedback fixes
- Re-build with final marketing version (e.g. 1.0.0 — build 5)
- Final Pre-Submission Checklist walkthrough (Phase 5 doc)
- App Store Connect: review submission, fill all metadata, attach screenshots, set release type (Manual)
- Demo account credentials for the reviewer (pre-paired test couple): document in submission notes
- Submit for Review

### Day 20-21 — Address rejections (buffer)

- Realistic expectation: 1 minor rejection, ~24-48h to fix and resubmit
- Common: clarify "not therapy" framing, fix any IAP language issues, fix a privacy disclosure
- Resubmit; should land within 7 days of first submission

---

## Critical Apple-specific decisions

### Sign in with Apple — adding it

**Why now and not later:** Apple Guideline 4.8 says any app offering third-party SSO must offer Sign in with Apple. We only have email/password today, so technically not required. But:
- We may want to add Google sign-in for friction reduction later
- App Review has been flagging SiwA omission preemptively on apps that "could reasonably add" social SSO
- SiwA is one expo-apple-authentication import away

Add it. Configure as a sign-in option alongside email/password.

### Subscription billing — App Store Connect setup

- One SKU: `us_annual_999`
- Auto-renewable subscription, group: "Us Premium"
- Price tier 10 ($9.99 USD)
- Duration: 1 year
- Introductory offer: Free trial, 1 week, eligible for new subscribers only
- Subscription description (shown in App Store + iOS Subscriptions): "Premium access to Us — unlimited slider sync, notifications, suggestions, comm mode."
- Localization: English (US) required; add more later

### "Restore Purchases" button — REQUIRED

Apple Guideline 3.1.1 mandates this. Place in Settings → Account section, label "Restore Purchases". On tap, calls RevenueCat's `restorePurchases()` and updates subscription status.

### Account deletion in IAP context

When a user deletes their account, RevenueCat subscription does NOT auto-cancel (Apple owns the subscription). We must:
- Show a clear notice in the deletion confirmation: "Your subscription is managed by Apple. To stop billing, also cancel from Settings → Apple ID → Subscriptions."
- Provide a deep-link button to iOS Settings: `Linking.openURL('itms-apps://apps.apple.com/account/subscriptions')`
- Do NOT touch the receipt server-side — Apple disallows it

### Privacy Manifest (Required for iOS 17+)

`ios/PrivacyInfo.xcprivacy` file declaring:
- Required reason APIs: UserDefaults (1C8F.1)
- Tracking: None
- Tracking Domains: None
- Collected data types: User ID (linked, app functionality)

Expo SDK 51+ handles most of this automatically; verify before build.

---

## What does NOT need to ship in Phase 4

Skip these for v1.0:
- Android version (separate effort, EAS supports both, but ship iOS first)
- Web push (PWA can stay alive with the current local notifications)
- Custom Sign in with Apple flow if email/password covers most users
- In-app feedback form
- Apple Watch / iOS widgets / lock screen complications
- Streak counters or gamification
- AI-generated suggestions

These are all v1.1+ work.

---

## Open questions for Zev before Phase 4 kickoff

1. **Bundle ID** — `app.twoof.us` recommended. Confirm after registering `twoof.us`.
2. **Apple Developer Program enrollment** — assumed yes (you have it for CustodyLog). Same team / different team?
3. **App Store Connect app name** — "Us" might collide with existing apps. Backup: "Us: For Couples" or "Us — Just the Two of You". Search the App Store before locking.
4. **Whether to add Sign in with Apple in Phase 4 or defer to v1.1** — see Critical Decisions section. Recommend: add.
5. **Sentry/Crashlytics** for crash reporting in production. Recommend: yes, free tier covers indie scale.

---

## Cost estimate (recurring)

| Item | Cost |
|---|---|
| Apple Developer Program (existing) | $99/yr |
| RevenueCat | Free up to $10K MTR |
| Expo EAS Build | Free for managed projects; $19/mo for priority builds |
| Firebase Spark (current) | Free; may need Blaze upgrade for Cloud Functions ($0 unless heavy use) |
| Sentry | Free (5K errors/mo) |
| Domain `twoof.us` | $15-25/yr |

Total: **~$140-180/yr to run** at zero-revenue scale. Grows with users.

---

## Go/no-go gate before submission

Final Phase 5 checklist (separate doc) must be 100% green before pressing "Submit". No exceptions.
