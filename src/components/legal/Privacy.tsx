import LegalLayout from './LegalLayout';

const EFFECTIVE_DATE = '2026-05-12';

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" effective={EFFECTIVE_DATE}>
      <p>
        This Privacy Policy explains what data <strong>Us</strong> ("the App") collects, how we use it, and the
        choices you have. We collect as little as possible to make the App work. We do not sell your data and we
        do not show ads.
      </p>

      <h2>1. What We Collect</h2>
      <ul>
        <li>
          <strong>Account information</strong>: email address, display name, and the date you signed up. Email
          and password handling is delegated to Firebase Authentication (Google).
        </li>
        <li>
          <strong>App state</strong>: your Thinking↔Feeling slider value (0–100), your Together/Apart status, and
          the timestamp of your last update. Stored in Firebase Realtime Database.
        </li>
        <li>
          <strong>Couple links</strong>: when you accept a partner invite, we record which two account IDs are
          linked. Both partners can see each other's current slider state and a shared history of past slider values.
        </li>
        <li>
          <strong>Subscription status</strong>: whether your subscription is active, in trial, or expired. Processed
          by the App Store, Google Play, or our web payment processor; we receive only the status flag.
        </li>
        <li>
          <strong>Device notification token</strong> (only if you enable notifications): an opaque identifier
          provided by your device's operating system, used to send your partner-state notifications. Stored only
          while notifications are enabled.
        </li>
      </ul>

      <h2>2. What We Do Not Collect</h2>
      <ul>
        <li>Free-text journal entries, voice, or photos.</li>
        <li>Location, contacts, calendar, or other device data.</li>
        <li>Advertising identifiers or third-party analytics behavior across other apps or websites.</li>
        <li>Health data, biometric data, or anything that would fall under HIPAA. Us is not a medical product.</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <p>We use the data above only to:</p>
      <ul>
        <li>Show you and your linked partner each other's current slider state and status.</li>
        <li>Compute couple-level metrics and surface activity suggestions in the App.</li>
        <li>Send notifications you've explicitly enabled.</li>
        <li>Process payments and verify subscription status.</li>
        <li>Debug and fix the App when something breaks.</li>
      </ul>

      <h2>4. Who Sees Your Data</h2>
      <ul>
        <li><strong>You</strong>.</li>
        <li><strong>Your linked partner</strong>, for the data fields the App surfaces (current slider, together/apart, last-updated, name).</li>
        <li>
          <strong>Service providers under contract</strong>: Google Firebase (authentication, database), Apple/Google
          (subscription processing), our web hosting provider. These vendors process data only to provide the service.
        </li>
        <li>
          <strong>Law enforcement</strong>, only if compelled by valid legal process. We will notify you unless legally
          prohibited.
        </li>
      </ul>
      <p>We do not sell, rent, or trade your personal information.</p>

      <h2>5. Where Your Data Lives</h2>
      <p>
        Data is stored in Google Firebase servers in the United States. Subscription processors operate globally
        per their own policies.
      </p>

      <h2>6. How Long We Keep Data</h2>
      <p>
        Account and slider data are retained as long as your account is active. When you delete your account
        (in-app, from Settings → Delete Account), we remove your user record and your partner subtree within 30
        days. If you are the last member of a couple, the couple's shared history is deleted with you.
      </p>
      <p>
        Backups may retain deleted data for up to 60 days before being overwritten in normal rotation.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        You can, at any time:
      </p>
      <ul>
        <li><strong>Access</strong> your data from within the App.</li>
        <li><strong>Edit</strong> your display name and slider values directly in the App.</li>
        <li><strong>Export</strong> your data — email <a href="mailto:hello@twoof.us">hello@twoof.us</a> and we'll send a JSON file within 30 days.</li>
        <li><strong>Delete</strong> your account in-app (Settings → Delete Account) or by emailing us.</li>
        <li><strong>Withdraw consent</strong> for notifications via your device settings or the bell icon in the App header.</li>
      </ul>
      <p>
        California residents have rights under CCPA (access, deletion, portability, opt-out of sale — we do not
        sell). EU/UK residents have rights under GDPR (access, rectification, erasure, restriction, objection,
        portability). To exercise any of these rights beyond what's available in-app, email{' '}
        <a href="mailto:hello@twoof.us">hello@twoof.us</a>.
      </p>

      <h2>8. Children</h2>
      <p>
        The App is intended for users 13 and older. We don't knowingly collect data from children under 13. If you
        believe a child under 13 has created an account, email{' '}
        <a href="mailto:hello@twoof.us">hello@twoof.us</a> and we'll delete it.
      </p>

      <h2>9. Security</h2>
      <p>
        Data in transit is encrypted via HTTPS. Data at rest is encrypted by Google Firebase's standard
        encryption. We use Firebase security rules to restrict access — only members of a given couple can read
        that couple's data; only you can read your user record. No system is perfectly secure; if a breach occurs
        we will notify affected users without undue delay.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy. Material changes will be announced in-app and require fresh acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Email <a href="mailto:hello@twoof.us">hello@twoof.us</a>. Mailing address available on request.
      </p>
    </LegalLayout>
  );
}
