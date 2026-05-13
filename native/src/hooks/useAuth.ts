import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '../firebase';

export interface SignupInput {
  email: string;
  password: string;
  displayName: string;
}

export function useAuth() {
  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    await signInWithEmailAndPassword(auth, trimmedEmail, password);
  };

  const signup = async ({ email, password, displayName }: SignupInput) => {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();
    if (cleanName.length === 0) {
      throw new Error('Please enter your name.');
    }

    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });

    await set(ref(db, `users/${cred.user.uid}`), {
      email: trimmedEmail,
      displayName: cleanName,
      coupleId: null,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { login, signup, logout };
}
