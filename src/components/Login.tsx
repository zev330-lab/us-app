import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      if (err.message === 'This email is not registered.') {
        setError(err.message);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>

      {/* Logo */}
      <div className="mb-14 animate-fade-in">
        <h1 className="text-7xl font-semibold italic text-text-primary"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Us
        </h1>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4 animate-fade-in stagger-2">
        <div>
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
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                       text-text-primary placeholder-text-secondary/40 text-sm
                       focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20
                       transition-all duration-200"
          />
        </div>

        {error && (
          <p className="text-feeling/80 text-sm text-center px-2">{error}</p>
        )}

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
          {loading ? 'Entering...' : 'Enter'}
        </button>
      </form>

      {/* Decorative */}
      <div className="mt-20 flex items-center gap-3 opacity-20">
        <div className="w-2 h-2 rounded-full bg-thinking" />
        <div className="w-1 h-1 rounded-full bg-blend" />
        <div className="w-2 h-2 rounded-full bg-feeling" />
      </div>
    </div>
  );
}
