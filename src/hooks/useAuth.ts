import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { PARTNER_MAP } from '../types';

export function useAuth() {
  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!PARTNER_MAP[trimmedEmail]) {
      throw new Error('This email is not registered.');
    }
    await signInWithEmailAndPassword(auth, trimmedEmail, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { login, logout };
}
