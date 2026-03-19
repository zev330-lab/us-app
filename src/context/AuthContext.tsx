import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import type { PartnerId } from '../types';
import { PARTNER_MAP } from '../types';

interface AuthContextType {
  user: User | null;
  partnerId: PartnerId | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  partnerId: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partnerId, setPartnerId] = useState<PartnerId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        setPartnerId(PARTNER_MAP[firebaseUser.email] || null);
      } else {
        setPartnerId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, partnerId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
