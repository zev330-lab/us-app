# Zev + Irit — End-to-End Test Script

> Use this after the latest deploy lands on https://zev330-lab.github.io/us-app/.
> Total time: ~15 minutes for both of you together.
> Firebase state is reset clean — both your accounts exist but have no couple yet.

---

## Before you start

- **You'll need both phones / browsers.** One is "Phone Z" (Zev, zev330@gmail.com), one is "Phone I" (Irit, iritfeldmanpsyd@gmail.com).
- **The Firebase state was reset.** Your accounts still exist with the right emails, but the couple is gone. You'll re-pair fresh. This is intentional — same flow a real new user would take.
- **The URL is** `https://zev330-lab.github.io/us-app/`. Open it on both devices.

---

## Round 1 — Onboarding both partners

### Step 1 (Phone Z — Zev):
1. Open the app URL.
2. You should land on the **sign-in screen** ("Us" logo, "JUST THE TWO OF YOU", email/password fields).
   - If you're auto-signed-in to your old Auth session, you'll land on the **disclaimer** instead. That's fine — skip to Step 2.
3. Enter your email + password and tap "Enter."
4. ✅ You should land on the **"It's a tool, not a therapist"** disclaimer screen.

### Step 2 (Phone Z — Zev):
1. Read the two callouts ("It's a tool, not a therapist" + "Use it with consent"). These are what the Apple reviewer will see.
2. Tap **"I understand — continue."**
3. ✅ You should land on the **Pair screen** ("Welcome, Zev" with a pencil-edit icon next to your name).

### Step 3 (Phone Z — Zev):
1. Tap **"I'll send my partner a code"**.
2. Tap **"Generate code"**.
3. ✅ You should land on the **Dashboard** with a "Link your partner" card showing a 6-character code (e.g. `ABC234`) and Copy / New code buttons.
4. Tap **Copy** to put the code on your clipboard.
5. **Text the code to Irit's phone.**

### Step 4 (Phone I — Irit):
1. Open the app URL.
2. If auto-signed-in, skip ahead. Otherwise, enter Irit's email + password and tap Enter.
3. ✅ Land on the **disclaimer screen**. Read it; tap **"I understand — continue."**
4. ✅ Land on the **Pair screen** ("Welcome, Irit" / or whatever her stored display name was — she can edit it now by tapping the pencil if it looks off).
5. Tap **"My partner sent me a code"**.
6. Type or paste the code from Zev. The field auto-uppercases and only accepts the unambiguous alphabet (no 0/O, 1/I/L mix-ups).
7. Tap **"Link with my partner"**.
8. ✅ Both phones should now show the **Dashboard with each other's partner card**.

**If anything in Round 1 didn't work, stop here and tell me which step.**

---

## Round 2 — Real-time sync (both phones, kept open side-by-side)

### Step 5 (both):
1. **Phone Z** — drag the slider toward Feeling (right side). Hold for a second.
2. ✅ **Phone I** should show Zev's partner card update within ~1 second with the new percentage.
3. ✅ **Phone I's "Us"** card should update the couple-net score (will swing toward positive since Zev moved toward feeling).
4. ✅ Comm Mode card on both phones should reflect the new combined state.

### Step 6 (both):
1. **Phone I** — tap the **Apart** side of the pill toggle at the top.
2. ✅ **Phone Z** should show "Irit apart" in the small status indicator on the right.
3. ✅ The "How to Connect" suggestion should change (because together-status changed).

### Step 7 (both, watch one phone):
1. Pick one phone, drag the slider all the way to one extreme (say, full Feeling = 100%).
2. Move it to the other extreme (full Thinking = 0% feeling).
3. ✅ Watch the couple-net score swing across the bucket boundaries — should go through Deep Connection → Feeling Good → Balanced → Thinking Mode → Heavy Thinking as the combined score crosses the bands.
4. ✅ Suggestions card should rotate to bucket-appropriate ones. Tap the refresh arrow on Suggestions — should rotate.

---

## Round 3 — Settings & legal pages

### Step 8 (Phone Z):
1. Tap the **gear icon** in the top-right of the Dashboard.
2. ✅ Land on Settings: Profile (Name + Email), Notifications, Your couple (Unlink partner), Legal (Terms / Privacy), Account (Sign out / Delete account).
3. Tap the **pencil next to your name**. Try a name like "Zev S.". Tap the check to save.
4. ✅ **Phone I** should immediately show "Zev S." on its partner card.

### Step 9 (Phone Z):
1. From Settings, tap **Terms of Service**.
2. ✅ Full legal page renders. Try scrolling — there should be 12 numbered sections including pricing, "not therapy" disclaimer, account-deletion rights, etc.
3. Tap **Back**.
4. Tap **Privacy Policy**.
5. ✅ Full privacy page renders — what we collect, what we don't, your rights.
6. Tap Back to Settings, then Back to Dashboard.

### Step 10 (one of you — pick whichever phone you don't mind disturbing):
1. From Settings, tap **Unlink partner**.
2. Tap **Unlink** in the confirmation card.
3. ✅ You should go back to the **Pair screen** automatically. Couple link is gone on this side.
4. ✅ **The other phone** should immediately show the "Link your partner" banner on Dashboard (because their partner left the couple).
5. Generate a new code on this phone, share it with the other phone, redeem it. **You should be linked again.**

---

## Round 4 — Edge-case redemption errors (optional but recommended)

### Step 11 — bad codes:
On either phone, **Sign out** (Settings → Sign out). Sign back in. Choose **"My partner sent me a code"** to access the redemption screen.

Try entering:
- `ZZZZZZ` → ✅ "We couldn't find that code. Double-check with your partner."
- (try a code that has `0`, `O`, `1`, `I`, or `L`) → submit should stay disabled OR "That code doesn't look right."
- (your current invite code) → ✅ "That's your own code — share it with your partner instead."

---

## Round 5 — Account deletion (do this ONLY if you actually want to test it)

> This permanently deletes your account. The recovery path is re-signing-up with the same email.

### Step 12:
1. Settings → **Delete account**.
2. The card expands to show your account-deletion confirmation with a password field.
3. Enter your password. Tap **Delete forever**.
4. ✅ You should be signed out and back on the sign-in screen. **Your data is gone from Firebase.**
5. To restore: sign up fresh with the same email. You'll go through onboarding from scratch.

**Do NOT do Step 12 unless you want to actually delete one of your accounts.**

---

## Things I'd like you to specifically eyeball

- **On the disclaimer screen**: does the language read right? Is "It's a tool, not a therapist" + "Use it with consent" the framing you want?
- **On Settings**: anything you wish was there but isn't? (e.g. "About / version", "Send feedback"?)
- **On the Pair fork screen**: are the two big buttons ("I'll send" vs "My partner sent") clear?
- **The displayName auto-bootstrap**: if you sign in fresh, my code uses the email-prefix as a fallback (e.g. `zev330` from `zev330@gmail.com`). The Pair screen detects this and prompts you to edit. Does that catch your case?
- **The "How to Connect" suggestion** at various slider positions — is the language helpful? Anything tone-off?
- **The suggestion list** at the bottom — do they feel like real things a couple would do?

---

## After you're done

Tell me:
1. Which steps passed cleanly ✅
2. Which failed ❌ (and at what step number)
3. Any UX feedback / "this feels off" / "I wanted a button for X" notes

I'll fix everything that broke, then we go straight to the Expo native port.
