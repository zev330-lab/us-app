import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

type Mode = 'login' | 'signup';

function authErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message === 'Please enter your name.') {
    return err.message;
  }
  const code = (err as { code?: string }).code;
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Incorrect email or password.';
  }
  if (code === 'auth/user-not-found') return 'No account found with this email.';
  if (code === 'auth/email-already-in-use') return 'An account already exists for this email.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again later.';
  return 'Something went wrong. Try again.';
}

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup({ email, password, displayName });
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>

      <div className="mb-10 animate-fade-in">
        <h1 className="text-7xl font-semibold italic text-text-primary"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Us
        </h1>
        <p className="text-center text-text-secondary/60 text-xs mt-3 tracking-widest uppercase">
          Just the two of you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4 animate-fade-in stagger-2">
        {isSignup && (
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
            className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                       text-text-primary placeholder-text-secondary/40 text-sm
                       focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20
                       transition-all duration-200"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                     text-text-primary placeholder-text-secondary/40 text-sm
                     focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20
                     transition-all duration-200"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignup ? 'Choose a password' : 'Password'}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
          minLength={6}
          className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                     text-text-primary placeholder-text-secondary/40 text-sm
                     focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20
                     transition-all duration-200"
        />

        {error && <p className="text-feeling/80 text-sm text-center px-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-medium text-sm
                     text-bg-deep
                     bg-gradient-to-r from-accent to-[#d4b87a]
                     hover:brightness-110
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 mt-2"
        >
          {loading ? (isSignup ? 'Creating account…' : 'Entering…') : (isSignup ? 'Create account' : 'Enter')}
        </button>

        <button
          type="button"
          onClick={() => { setError(''); setMode(isSignup ? 'login' : 'signup'); }}
          className="w-full text-center text-text-secondary/60 text-xs hover:text-text-primary transition-colors mt-3"
        >
          {isSignup ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </form>

      <div className="mt-16 flex items-center gap-3 opacity-20">
        <div className="w-2 h-2 rounded-full bg-thinking" />
        <div className="w-1 h-1 rounded-full bg-blend" />
        <div className="w-2 h-2 rounded-full bg-feeling" />
      </div>
    </div>
  );
}
