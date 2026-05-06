import { AuthProvider, useAuthContext } from './context/AuthContext';
import Auth from './components/Auth';
import Pair from './components/Pair';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, userDoc, coupleId, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)' }}>
        <div className="text-text-secondary text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) return <Auth />;
  if (!userDoc || !coupleId) return <Pair />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
