import { AuthProvider, useAuthContext } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, partnerId, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #1A1A2E, #16213E)' }}>
        <div className="text-text-secondary text-sm">Loading...</div>
      </div>
    );
  }

  if (!user || !partnerId) {
    return <Login />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
