import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  type User,
} from 'firebase/auth';
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../firebase';

export type DeleteAccountError =
  | 'requires_password'
  | 'wrong_password'
  | 'too_many_requests'
  | 'network'
  | 'unknown';

interface DeleteResult {
  ok: true;
}
interface DeleteFailure {
  ok: false;
  error: DeleteAccountError;
}

/**
 * Cascading deletion of the current user's account.
 *
 * 1. If the user belongs to a couple, remove their partner subtree and members
 *    entry. If they were the last member, delete the entire couple doc
 *    (history included).
 * 2. Delete the users/{uid} doc.
 * 3. Delete the Firebase Auth user.
 *
 * Step 3 requires a recent sign-in (Firebase's "sensitive operation" rule). If
 * the caller does not pass a password and Firebase throws
 * auth/requires-recent-login, we return 'requires_password' so the UI can
 * prompt and re-call. If a password is passed, we re-authenticate first.
 */
export async function deleteCurrentAccount(
  user: User,
  coupleId: string | null,
  password?: string,
): Promise<DeleteResult | DeleteFailure> {
  const uid = user.uid;

  // ── 1. Detach from couple (or delete it if we're the last member) ──
  if (coupleId) {
    try {
      const membersSnap = await get(ref(db, `couples/${coupleId}/members`));
      const members: Record<string, true> = membersSnap.val() ?? {};
      const otherMembers = Object.keys(members).filter((k) => k !== uid);

      if (otherMembers.length === 0) {
        await remove(ref(db, `couples/${coupleId}`));
      } else {
        await update(ref(db), {
          [`couples/${coupleId}/members/${uid}`]: null,
          [`couples/${coupleId}/partners/${uid}`]: null,
        });
      }
    } catch (e) {
      console.warn('[Us] couple detach failed during account delete:', e);
      return { ok: false, error: 'unknown' };
    }
  }

  // ── 2. Delete user doc ──
  try {
    await remove(ref(db, `users/${uid}`));
  } catch (e) {
    console.warn('[Us] user-doc delete failed:', e);
    return { ok: false, error: 'unknown' };
  }

  // ── 3. Re-auth (if password provided) and delete Auth user ──
  if (password && user.email) {
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return { ok: false, error: 'wrong_password' };
      }
      if (code === 'auth/too-many-requests') {
        return { ok: false, error: 'too_many_requests' };
      }
      return { ok: false, error: 'unknown' };
    }
  }

  try {
    await deleteUser(user);
    return { ok: true };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/requires-recent-login') {
      return { ok: false, error: 'requires_password' };
    }
    if (code === 'auth/network-request-failed') {
      return { ok: false, error: 'network' };
    }
    return { ok: false, error: 'unknown' };
  }
}

/**
 * Detach the current user from their couple without deleting their account.
 * Used by the "Unlink partner" button in Settings. If the user was the last
 * member, the couple is deleted entirely.
 */
export async function unlinkFromCouple(
  uid: string,
  coupleId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const membersSnap = await get(ref(db, `couples/${coupleId}/members`));
    const members: Record<string, true> = membersSnap.val() ?? {};
    const otherMembers = Object.keys(members).filter((k) => k !== uid);

    if (otherMembers.length === 0) {
      await remove(ref(db, `couples/${coupleId}`));
    } else {
      await update(ref(db), {
        [`couples/${coupleId}/members/${uid}`]: null,
        [`couples/${coupleId}/partners/${uid}`]: null,
      });
    }

    // Clear user's coupleId so they land back on Pair screen.
    await update(ref(db, `users/${uid}`), { coupleId: null });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
