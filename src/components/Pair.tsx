import { useState, type FormEvent } from 'react';
import { LogOut } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import {
  createCoupleAndInvite,
  redeemInviteCode,
  type RedeemInviteError,
} from '../services/coupling';
import { normalizeInviteCode } from '../lib/inviteCode';

type Choice = 'fresh' | 'join' | null;

const REDEEM_ERROR_TEXT: Record<RedeemInviteError, string> = {
  invalid_format: "That code doesn't look right. It should be 6 letters/numbers.",
  not_found: "We couldn't find that code. Double-check with your partner.",
  already_redeemed: 'That code has already been used.',
  expired: 'That code expired. Ask your partner for a fresh one.',
  self_redeem: "That's your own code — share it with your partner instead.",
  couple_full: 'That couple already has two members.',
};

export default function Pair() {
  const { user, userDoc } = useAuthContext();
  const { logout } = useAuth();

  const [choice, setChoice] = useState<Choice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fresh-couple state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Join-couple state
  const [codeInput, setCodeInput] = useState('');

  if (!user || !userDoc) return null;

  const handleCreateFresh = async () => {
    setSubmitting(true);
    setError('');
    try {
      const result = await createCoupleAndInvite(user.uid, userDoc.displayName);
      setGeneratedCode(result.inviteCode);
    } catch {
      setError("We couldn't create your couple. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await redeemInviteCode(codeInput, user.uid, userDoc.displayName);
    setSubmitting(false);
    if ('error' in result) {
      setError(REDEEM_ERROR_TEXT[result.error]);
    }
    // On success, AuthContext picks up new coupleId and App.tsx routes to Dashboard.
  };

  return (
    <div className="min-h-screen flex flex-col px-8"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>

      <header className="flex justify-between items-center pt-6">
        <h1 className="text-3xl font-semibold italic text-text-primary"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Us
        </h1>
        <button
          onClick={logout}
          className="p-2 rounded-full hover:bg-white/5 transition-colors text-text-secondary/60 hover:text-text-primary"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {choice === null && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-text-primary text-lg text-center mb-8">
              Welcome, {userDoc.displayName}. Are you the first one here?
            </p>
            <button
              onClick={() => setChoice('fresh')}
              className="w-full py-4 rounded-2xl font-medium text-sm text-bg-deep
                         bg-gradient-to-r from-accent to-[#d4b87a] hover:brightness-110
                         transition-all duration-200"
            >
              I'll send my partner a code
            </button>
            <button
              onClick={() => setChoice('join')}
              className="w-full py-4 rounded-2xl font-medium text-sm
                         bg-white/[0.04] border border-white/[0.08] text-text-primary
                         hover:bg-white/[0.08] transition-all duration-200"
            >
              My partner sent me a code
            </button>
          </div>
        )}

        {choice === 'fresh' && !generatedCode && (
          <div className="space-y-4 animate-fade-in text-center">
            <p className="text-text-primary text-base">
              We'll generate a code for you to share with your partner.
              They'll enter it on their phone to link your accounts.
            </p>
            <button
              onClick={handleCreateFresh}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-medium text-sm text-bg-deep
                         bg-gradient-to-r from-accent to-[#d4b87a] hover:brightness-110
                         disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? 'Generating…' : 'Generate code'}
            </button>
            <button
              type="button"
              onClick={() => setChoice(null)}
              className="text-text-secondary/60 text-xs hover:text-text-primary transition-colors"
            >
              ← Back
            </button>
            {error && <p className="text-feeling/80 text-sm">{error}</p>}
          </div>
        )}

        {choice === 'fresh' && generatedCode && (
          <div className="space-y-6 animate-fade-in text-center">
            <p className="text-text-secondary text-sm">
              Share this code with your partner. It expires in 24 hours.
            </p>
            <div className="py-8 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-5xl font-mono tracking-[0.3em] text-accent"
                 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {generatedCode}
              </p>
            </div>
            <p className="text-text-secondary/70 text-xs leading-relaxed">
              Once they enter it on their device, you'll see each other live.
            </p>
            <p className="text-text-secondary/50 text-xs italic mt-8">
              Waiting for {userDoc.displayName}'s partner…
            </p>
          </div>
        )}

        {choice === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4 animate-fade-in">
            <p className="text-text-primary text-base text-center mb-2">
              Enter the 6-character code your partner sent you.
            </p>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(normalizeInviteCode(e.target.value))}
              placeholder="ABC123"
              maxLength={6}
              autoFocus
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                         text-text-primary placeholder-text-secondary/40
                         text-2xl tracking-[0.3em] text-center font-mono
                         focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20
                         transition-all duration-200"
            />
            {error && <p className="text-feeling/80 text-sm text-center px-2">{error}</p>}
            <button
              type="submit"
              disabled={submitting || codeInput.length !== 6}
              className="w-full py-4 rounded-2xl font-medium text-sm text-bg-deep
                         bg-gradient-to-r from-accent to-[#d4b87a] hover:brightness-110
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {submitting ? 'Linking…' : 'Link with my partner'}
            </button>
            <button
              type="button"
              onClick={() => { setChoice(null); setCodeInput(''); setError(''); }}
              className="w-full text-center text-text-secondary/60 text-xs hover:text-text-primary transition-colors"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
