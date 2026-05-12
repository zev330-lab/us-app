import { AuthProvider, useAuthContext } from './context/AuthContext';
import Auth from './components/Auth';
import Pair from './components/Pair';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Disclaimer from './components/Disclaimer';
import Terms from './components/legal/Terms';
import Privacy from './components/legal/Privacy';
import { useRoute } from './lib/router';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)' }}>
      <div className="text-text-secondary text-sm">Loading…</div>
    </div>
  );
}

function AppContent() {
  const { user, userDoc, coupleId, loading } = useAuthContext();
  const path = useRoute();

  // ── Public routes: accessible without auth. Reviewer must be able to load
  // these via direct URL when checking App Store submission fields. ──
  if (path === '/terms') return <Terms />;
  if (path === '/privacy') return <Privacy />;

  if (loading) return <Loading />;

  // ── Auth state machine ──
  if (!user) return <Auth />;
  if (!userDoc) return <Loading />;

  // First-time gate: must accept "not therapy" disclaimer before anything else.
  if (!userDoc.acceptedDisclaimer) return <Disclaimer />;

  // Authed routes:
  if (path === '/settings') return <Settings />;

  if (!coupleId) return <Pair />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
