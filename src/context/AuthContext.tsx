import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, get, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '../firebase';
import type { UserDoc } from '../types';

interface AuthContextType {
  user: User | null;
  userDoc: UserDoc | null;
  coupleId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  coupleId: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);

  // Auth listener + one-shot bootstrap for legacy accounts.
  //
  // The bootstrap lives HERE, not in the value listener below, on purpose:
  // accounts can land here with no users/{uid} doc when they're either
  // (a) brand-new signups whose seed write is still in flight, or (b) legacy
  // Firebase Auth accounts created before the multi-tenant rewrite. In both
  // cases we want one bootstrap write, not a re-bootstrap every time the doc
  // is missing — otherwise account deletion races against the listener and
  // resurrects a zombie doc the instant we delete it.
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (!firebaseUser) {
        setUserDoc(null);
        return;
      }
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      try {
        const snap = await get(userRef);
        if (!snap.exists()) {
          await set(userRef, {
            email: firebaseUser.email ?? '',
            displayName:
              firebaseUser.displayName?.trim() ||
              firebaseUser.email?.split('@')[0] ||
              'You',
            coupleId: null,
            createdAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn('[Us] user-doc bootstrap failed:', e);
      }
    });
  }, []);

  // Live listener — reflects current state only. Never writes.
  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      setDocLoading(false);
      return;
    }
    setDocLoading(true);
    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        setUserDoc(snapshot.exists() ? (snapshot.val() as UserDoc) : null);
        setDocLoading(false);
      },
      (error) => {
        console.warn('[Us] users/{uid} read failed:', error.message);
        setUserDoc(null);
        setDocLoading(false);
      },
    );
    return () => unsubscribe();
  }, [user]);

  const loading = authLoading || (!!user && docLoading);
  const coupleId = userDoc?.coupleId ?? null;

  return (
    <AuthContext.Provider value={{ user, userDoc, coupleId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
