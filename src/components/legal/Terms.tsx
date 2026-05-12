import LegalLayout from './LegalLayout';

const EFFECTIVE_DATE = '2026-05-12';

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" effective={EFFECTIVE_DATE}>
      <p>
        These Terms of Service ("Terms") govern your use of <strong>Us</strong> (the "App"), provided by
        Steinmetz Labs ("we", "us", "our"). By creating an account or using the App, you agree to these Terms.
        If you don't agree, don't use the App.
      </p>

      <h2>1. What Us Is — and What It Isn't</h2>
      <p>
        Us is a real-time emotional dashboard for two consenting adult partners. Each partner moves a Thinking↔Feeling
        slider on their own device; the App shows both states live, calculates a couple-level score, and surfaces
        activity suggestions based on the combined state.
      </p>
      <p className="emphasis">
        <strong>Us is not therapy, medical advice, or a diagnostic tool.</strong> It does not provide professional
        mental-health services, crisis intervention, or treatment for any condition. If you or your partner are
        in distress, contact a licensed mental-health professional or, in an emergency, call 911 (US) or your
        local emergency number. Us is not a substitute for human judgment, communication, or care.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 13 years old and have the legal capacity to enter these Terms. The App is designed for
        adult couples in a consenting partnership. You agree to use the App only with your own partner who has
        independently consented to use it.
      </p>

      <h2>3. Your Account</h2>
      <p>
        You're responsible for your account credentials and any activity under your account. You agree to provide
        accurate information at signup and to keep it current. We use Firebase Authentication for sign-in;
        your email and password are stored by Google under their{' '}
        <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noreferrer">Firebase privacy practices</a>.
      </p>

      <h2>4. Subscription</h2>
      <p>
        After a 7-day free trial, the App charges $9.99 per user per year. Each partner subscribes individually;
        one partner's subscription does not unlock features for the other. Trials and subscriptions are billed
        through the Apple App Store, Google Play, or our web payment processor depending on where you signed up,
        and managed through those platforms' subscription settings.
      </p>
      <p>
        You can cancel anytime through your platform's subscription management screen. Cancellation takes effect
        at the end of the current billing period; we do not refund partial periods except where required by law.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the App to coerce, surveil, or control another person without their explicit, ongoing consent.</li>
        <li>Reverse-engineer, scrape, or attempt to circumvent the App's security or rate limits.</li>
        <li>Use the App to share illegal content or to harass another person.</li>
        <li>Impersonate someone else or create accounts on behalf of someone who hasn't consented.</li>
      </ul>

      <h2>6. Your Data</h2>
      <p>
        We collect and store the data described in our{' '}
        <a href="/privacy">Privacy Policy</a>. You can request export or deletion of your data at any time via the
        in-app Settings screen or by emailing <a href="mailto:hello@twoof.us">hello@twoof.us</a>. Deleting your
        account removes your slider state and partner subtree; if you are the last member of a couple, the
        couple's history is also deleted.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The App, including all source code, content, and design, is owned by Steinmetz Labs and protected by
        applicable copyright and trademark law. The text you enter (slider values, timestamps) remains yours;
        you grant us a limited license to store and display it solely to provide the service to you and your
        linked partner.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The App is provided "as is" without warranties of any kind. We don't guarantee that the App will be
        uninterrupted, error-free, or that the suggestions surfaced by the App will be appropriate for your
        situation. You use the App at your own discretion and risk.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Steinmetz Labs is not liable for any indirect, incidental,
        special, consequential, or punitive damages arising from your use of the App. Our total liability for
        any claim related to the App is limited to the greater of (a) the amount you paid us in the 12 months
        preceding the claim, or (b) $100 USD.
      </p>

      <h2>10. Dispute Resolution</h2>
      <p>
        Any dispute arising from these Terms or your use of the App will be resolved by binding arbitration
        administered by the American Arbitration Association under its Consumer Arbitration Rules, in
        Massachusetts, USA. You waive any right to a jury trial or to participate in a class action. This clause
        does not apply where prohibited by law.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms by posting a new version with a new effective date. Continued use after a
        change constitutes acceptance. Material changes will be flagged in-app.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions? <a href="mailto:hello@twoof.us">hello@twoof.us</a>.
      </p>
    </LegalLayout>
  );
}
