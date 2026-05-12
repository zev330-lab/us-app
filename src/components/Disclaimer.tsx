import { useState } from 'react';
import { Heart, Shield } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuthContext } from '../context/AuthContext';
import { navigate } from '../lib/router';

/**
 * First-time onboarding gate: shown to newly signed-up users (and any legacy
 * account that hasn't accepted yet) before they can reach the Pair screen.
 *
 * Apple App Review reads onboarding screens — having this explicit "not therapy"
 * gate visible before any subscription content gives us a clean answer to any
 * 1.4.1 ("encouraging dangerous behavior") or therapy-impersonation challenge.
 */
export default function Disclaimer() {
  const { user, userDoc } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);

  if (!user || !userDoc) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await update(ref(db, `users/${user.uid}`), { acceptedDisclaimer: Date.now() });
      // AuthContext picks up the update; App.tsx re-routes to Pair.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>
      <div className="max-w-md mx-auto px-6 py-8 min-h-screen flex flex-col">

        <header className="text-center mb-10">
          <h1 className="text-5xl font-semibold italic text-text-primary mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Us
          </h1>
          <p className="text-text-secondary/60 text-xs tracking-widest uppercase">
            Welcome, {userDoc.displayName}
          </p>
        </header>

        <div className="flex-1 flex flex-col justify-center space-y-6">

          <p className="text-text-primary text-lg leading-relaxed text-center">
            A real-time emotional dashboard for the two of you. Just slide. See each other.
            Know when to talk, when to text, when to just be.
          </p>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Heart size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-text-primary text-sm font-medium">It's a tool, not a therapist.</p>
                <p className="text-text-secondary/70 text-xs leading-relaxed mt-1">
                  Us is not therapy, not medical advice, and not a substitute for professional mental-health
                  care. If you're in crisis, contact a licensed professional or call 988 (US Suicide & Crisis
                  Lifeline) or your local emergency number.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-text-primary text-sm font-medium">Use it with consent.</p>
                <p className="text-text-secondary/70 text-xs leading-relaxed mt-1">
                  Both partners agree to share their state through this app. Don't use Us to monitor or pressure
                  someone who hasn't independently agreed to use it.
                </p>
              </div>
            </div>
          </div>

          <p className="text-text-secondary/60 text-xs text-center leading-relaxed">
            By continuing you accept our{' '}
            <button
              onClick={() => navigate('/terms')}
              className="text-accent underline underline-offset-2 hover:brightness-125"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              onClick={() => navigate('/privacy')}
              className="text-accent underline underline-offset-2 hover:brightness-125"
            >
              Privacy Policy
            </button>
            .
          </p>

          <button
            onClick={handleAccept}
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-medium text-sm text-bg-deep
                       bg-gradient-to-r from-accent to-[#d4b87a] hover:brightness-110
                       disabled:opacity-50 transition-all duration-200"
          >
            {submitting ? 'One sec…' : 'I understand — continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
