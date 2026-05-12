# Pre-Submission App Review Checklist

> Run this BEFORE pressing "Submit for Review" in App Store Connect. Every item must be GREEN. CustodyLog got rejected twice; this checklist exists so Us doesn't.

For each item: **status** | **how to verify** | **what reviewers actually test**

---

## 🔴 Hard requirements (reject on omission)

### 1.1.4 — Sexual content
- [ ] No explicit suggestions remain in `src/data/suggestions.ts`
- [ ] **Verify**: `npm test` runs the regex guard in `suggestions.test.ts` — fails if any banned terms reappear
- [ ] **Reviewer test**: scrolls through Dashboard, samples suggestions at extremes (deep + heavy buckets)

### 3.1.1 — In-App Purchase for digital content
- [ ] Subscription is gated through StoreKit/RevenueCat (not Stripe)
- [ ] **Verify**: tap "Upgrade" flow in TestFlight build with sandbox Apple ID — actual Apple receipt issued
- [ ] No web-redirect-to-Stripe inside the native app (Stripe is web-only)
- [ ] Pricing displayed matches App Store Connect: $9.99/year with 7-day free trial
- [ ] **Reviewer test**: opens app, attempts subscription, expects native Apple sheet

### 3.1.1 — Restore Purchases button
- [ ] Visible button labeled "Restore Purchases" in Settings → Account
- [ ] On tap, calls RevenueCat's `restorePurchases()` and shows result
- [ ] **Reviewer test**: deletes app, reinstalls, taps Restore, expects subscription to come back

### 4.8 — Sign in with Apple
- [ ] If any third-party social SSO is offered (Google, Facebook, X), SiwA MUST also be offered with equal prominence
- [ ] Decision: we offer email/password only; SiwA is OPTIONAL but recommended to add anyway
- [ ] If SiwA is added: tested on real device with hide-my-email and real-email paths
- [ ] **Reviewer test**: looks at the auth screen, checks if SiwA button is missing while other SSO is present

### 5.1.1(v) — Account deletion in-app
- [ ] "Delete Account" button reachable from Settings (already shipped in Phase 2)
- [ ] On tap: confirmation step + password re-auth step
- [ ] After deletion: user is signed out, Auth user removed, RTDB user doc removed, couple subtree cleaned
- [ ] Active subscription handling: app shows notice "Your subscription continues via Apple. Cancel in Settings → Apple ID → Subscriptions." with deep-link button
- [ ] **Reviewer test**: signs up, taps Delete Account, expects clean wipe

### 5.1.1 — Privacy policy
- [ ] Privacy Policy URL accessible without auth at `https://twoof.us/privacy`
- [ ] Privacy nutrition labels in App Store Connect match what's actually collected
- [ ] **Reviewer test**: opens the Privacy URL listed in App Store Connect; verifies content matches submitted labels

### 5.1.1 — Privacy nutrition labels
- [ ] Filled out accurately in App Store Connect:
  - Identifiers: User ID — linked to identity — used for app functionality
  - Contact info: Email — linked to identity — used for app functionality, account management
  - User content: None
  - Usage data: None
  - Diagnostics: Crash data (if Crashlytics/Sentry added) — not linked — used for analytics
  - Tracking: NO
- [ ] **Reviewer test**: cross-checks declared labels against in-app behavior — if app accesses something not declared, REJECTED

### 5.1.1 — Privacy Manifest
- [ ] `ios/PrivacyInfo.xcprivacy` exists declaring required-reason API usage
- [ ] Tracking: false; Tracking Domains: empty; Collected data types: User ID + Email (linked, app function)
- [ ] **Reviewer test**: Apple's static analysis scans the manifest; any undeclared API usage = REJECTED

---

## 🟡 Soft requirements (often rejected in practice)

### 4.0 — Meaningful functionality
- [ ] App does more than display content — has interaction (slider), real-time sync, multi-user coordination
- [ ] **Reviewer test**: opens app, expects it to "do something useful within 30 seconds"

### 4.2 — Minimum functionality
- [ ] Not just a webview wrapper. Native components used: native slider, native Auth sheet, native push, native subscription sheet
- [ ] **Reviewer test**: checks whether the app feels webby; if yes, rejected as a "repackaged website"

### 4.5.1 — Apple services
- [ ] If we send push notifications, we declare it in metadata
- [ ] If we use Sign in with Apple, we don't share that data with third parties beyond what's needed
- [ ] **Reviewer test**: opens notification settings, verifies what the app actually requests

### 5.1.2 — Data minimization
- [ ] Don't request permissions we don't need
- [ ] Notifications permission: only requested when user explicitly enables (via Settings toggle), not on launch
- [ ] **Reviewer test**: looks at launch flow, expects no premature permission prompts

### 1.4.1 — "Encouraging dangerous behavior"
- [ ] "Not therapy" disclaimer visible during onboarding (already shipped in Phase 2 — `Disclaimer.tsx`)
- [ ] Suggestions never include language that could harm a partner ("force them to talk", etc.)
- [ ] **Reviewer test**: reads onboarding text, samples suggestions for problematic content

### 2.3.10 — Accurate metadata
- [ ] App description matches what app does (no "AI-powered relationship coach" if it's a slider)
- [ ] Screenshots show real screens (no mockups, no Photoshop)
- [ ] Keywords don't include competitor names (no "Lasting", "Paired") or unrelated terms
- [ ] **Reviewer test**: compares screenshots vs running app

### 4.3 — Spam / duplicate apps
- [ ] App name "Us" is distinctive enough — search App Store before locking
- [ ] If "Us" is taken (likely is), use "Us: For Couples" or "Us — Just the Two of You"
- [ ] **Reviewer test**: searches App Store for similar names

---

## 🟢 Pre-flight tests (we run before submitting)

### Auth flow
- [ ] Email/password signup works
- [ ] Email/password sign-in works
- [ ] Sign in with Apple works (if added)
- [ ] Password reset works (Firebase email link)
- [ ] Sign-out works
- [ ] Account deletion works (with password re-auth)

### Pair flow
- [ ] First signup → Disclaimer → Pair fork screen
- [ ] "Send my partner a code" generates code, routes to Dashboard
- [ ] "My partner sent me a code" + valid code → links + routes to Dashboard
- [ ] Invalid code shows "We couldn't find that code"
- [ ] Expired code shows "That code expired"
- [ ] Self-redeem code shows "That's your own code"
- [ ] Already-redeemed code shows "That code has already been used"
- [ ] Regenerate code works from Dashboard UnlinkedBanner

### Dashboard
- [ ] Slider updates partner's view in real-time
- [ ] Together/Apart toggle syncs
- [ ] Couple score updates correctly across all bucket boundaries (-200 to +200)
- [ ] Comm Mode suggestion changes appropriately for status × net
- [ ] Suggestions refresh button rotates new selections
- [ ] Notifications fire (when enabled and tab/app hidden)

### Settings
- [ ] Edit display name persists + mirrors to couple/partners/{uid}/name
- [ ] Notifications toggle reflects browser/system state
- [ ] Unlink Partner: confirmation step + actual unlink → routes back to Pair
- [ ] Sign Out works
- [ ] Delete Account: confirmation → password re-auth → cascading delete → routes to Auth

### Subscription
- [ ] Free trial enrollment works (sandbox)
- [ ] Trial → paid transition works (sandbox, accelerated time)
- [ ] Cancellation flow: app links to iOS Settings → Apple ID → Subscriptions
- [ ] Restore Purchases works after fresh install
- [ ] Subscription status reflected in app UI (premium features unlocked)

### Edge cases
- [ ] Sign in offline → wait for connectivity → state syncs
- [ ] Partner goes offline → "updated Xm ago" timestamp keeps incrementing
- [ ] Force-quit app mid-slider-update → recovers cleanly
- [ ] Background app for 5 min, return → state still synced
- [ ] Push notification while app is open → handled (don't double-fire)
- [ ] Push notification while app is closed → opens app to Dashboard

### Accessibility
- [ ] All buttons have accessible labels (aria-label / accessibilityLabel)
- [ ] Slider has accessibility hint ("Move to set your state from thinking to feeling")
- [ ] VoiceOver navigation works through all screens
- [ ] Dynamic Type / large font support doesn't break layout
- [ ] Sufficient color contrast (the gold accent on dark background passes WCAG AA)

---

## 📋 App Store Connect submission prep

- [ ] App Information: name, subtitle, primary category (Lifestyle), secondary category (Social Networking)
- [ ] Pricing and Availability: Free with IAP, all territories
- [ ] App Privacy: nutrition labels filled (see 5.1.1 above)
- [ ] Age Rating: 13+ (no objectionable content, no in-app communication, no unrestricted web access)
- [ ] App Review Information:
  - Demo account credentials: pre-paired test couple (email + password for both)
  - Notes: "Us is a real-time emotional dashboard for two consenting partners. Both partners independently sign up and link via a 6-char invite code. The app displays each partner's self-reported emotional state on a slider, calculates a shared score, and surfaces non-therapeutic activity suggestions. Subscription is $9.99/year per user with a 7-day free trial. The app is explicitly NOT therapy — there's an onboarding disclaimer screen to that effect, visible to the reviewer on first launch with a new account."
  - Contact email + phone
- [ ] Version Release: Manual release (don't auto-release on approval — let Zev press the button)
- [ ] Screenshots: 6.5", 6.7", 5.5" — minimum 3 per size
- [ ] Marketing URL: `https://twoof.us`
- [ ] Support URL: `https://twoof.us` (or `https://twoof.us/support`)
- [ ] Privacy Policy URL: `https://twoof.us/privacy`

---

## 🚀 Submission day

1. Run this checklist top to bottom
2. Build with EAS: `eas build --profile production --platform ios`
3. Submit with EAS: `eas submit --profile production --platform ios`
4. Wait for build to process in App Store Connect (~30 min)
5. Attach build to the version
6. Fill any remaining metadata
7. Tap "Submit for Review"
8. Expected review time: 1-3 days

---

## If rejected

1. Read the rejection email CAREFULLY. The exact guideline cited is the answer.
2. Don't argue. Fix and resubmit.
3. CustodyLog patterns to watch for:
   - Build 12 rejection: paywall ToS links missing — we have ours
   - Build 13 rejection: Paid Apps Agreement not signed — verify before submitting
   - Build 14: still in review
4. Each resubmit takes 1-3 more days. Worst case: 4 cycles, 12 days total.

The goal is **first-submission acceptance**. If everything in this checklist is green, that's realistic.
