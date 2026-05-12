import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '../firebase';
import { navigate } from '../lib/router';

export interface SignupInput {
  email: string;
  password: string;
  displayName: string;
}

export function useAuth() {
  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    await signInWithEmailAndPassword(auth, trimmedEmail, password);
    // Same reasoning as signup: new auth session starts at root.
    navigate('/');
  };

  const signup = async ({ email, password, displayName }: SignupInput) => {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();
    if (cleanName.length === 0) {
      throw new Error('Please enter your name.');
    }

    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });

    // Seed the user doc. coupleId is null until they create or join one.
    await set(ref(db, `users/${cred.user.uid}`), {
      email: trimmedEmail,
      displayName: cleanName,
      coupleId: null,
      createdAt: serverTimestamp(),
    });

    // Reset URL so the new user flows from root → Disclaimer → Pair instead of
    // being stranded on a path inherited from a previous session.
    navigate('/');
  };

  const logout = async () => {
    await signOut(auth);
    // Reset URL to root so the post-logout Auth screen isn't sitting on /settings
    // or /onboarding — if the user reloads, they shouldn't land on a route they
    // can't access.
    navigate('/');
  };

  return { login, signup, logout };
}
