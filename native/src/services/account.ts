import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  type User,
} from 'firebase/auth';
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../firebase';

export type DeleteAccountError =
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
 * Order matters: re-auth FIRST (proves the user can complete the operation),
 * THEN delete RTDB state, THEN delete the Firebase Auth user. If re-auth fails
 * we abort with no DB writes — the user can retry. If the final Auth deletion
 * fails after DB writes succeeded, the user data is already gone (privacy
 * guarantee met) and the Auth account lingers but can be removed on a retry.
 *
 * The password is required, not optional. The previous "try without password
 * first, fall back if Firebase complains" flow has a fatal race: we'd remove
 * users/{uid} before deleteUser failed with requires-recent-login, leaving
 * the user authed-but-docless and stuck on the loading screen.
 */
export async function deleteCurrentAccount(
  user: User,
  coupleId: string | null,
  password: string,
): Promise<DeleteResult | DeleteFailure> {
  const uid = user.uid;

  if (!user.email) {
    return { ok: false, error: 'unknown' };
  }

  // ── 1. Re-auth FIRST (no DB writes yet) ──
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
    if (code === 'auth/network-request-failed') {
      return { ok: false, error: 'network' };
    }
    return { ok: false, error: 'unknown' };
  }

  // ── 2. Detach from couple (or delete it if we're the last member) ──
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

  // ── 3. Delete user doc ──
  try {
    await remove(ref(db, `users/${uid}`));
  } catch (e) {
    console.warn('[Us] user-doc delete failed:', e);
    return { ok: false, error: 'unknown' };
  }

  // ── 4. Delete Firebase Auth user ──
  try {
    await deleteUser(user);
    return { ok: true };
  } catch (e) {
    // RTDB data is already gone — privacy intact. If we get here, the Auth
    // account is orphaned; the user can sign in again (bootstrap re-creates a
    // fresh doc) and retry delete from Settings.
    const code = (e as { code?: string }).code;
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
