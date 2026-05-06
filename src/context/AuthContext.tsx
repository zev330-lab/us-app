import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
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

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (!firebaseUser) {
        setUserDoc(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setDocLoading(true);
    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserDoc(snapshot.val() as UserDoc);
          setDocLoading(false);
          return;
        }
        // Bootstrap a user doc for legacy auth accounts (created before the
        // multi-tenant rewrite shipped) so they don't get stranded on a blank
        // screen. Once the doc is written, this listener fires again with it.
        set(userRef, {
          email: user.email ?? '',
          displayName: user.displayName?.trim() || user.email?.split('@')[0] || 'You',
          coupleId: null,
          createdAt: serverTimestamp(),
        }).catch(() => setDocLoading(false));
      },
      (error) => {
        // Permission denied or network error: stop spinning, surface as null doc
        // so App.tsx can route to Pair (which has its own re-auth fallback).
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
