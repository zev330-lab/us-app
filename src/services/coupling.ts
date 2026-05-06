import {
  ref,
  update,
  serverTimestamp,
  runTransaction,
} from 'firebase/database';
import { db } from '../firebase';
import {
  generateInviteCode,
  normalizeInviteCode,
  isValidInviteCode,
  INVITE_CODE_TTL_MS,
} from '../lib/inviteCode';
import type { PartnerState } from '../types';

const DEFAULT_PARTNER_STATE: Omit<PartnerState, 'name' | 'lastUpdated'> = {
  thinking: 50,
  feeling: 50,
  together: true,
};

function newCoupleId(): string {
  // Firebase RTDB-friendly UUID (no dots, slashes, hashes).
  return crypto.randomUUID();
}

export interface CreateCoupleResult {
  coupleId: string;
  inviteCode: string;
  expiresAt: number;
}

/**
 * Create a fresh couple with the current user as the first member, then
 * generate a single-use invite code for the partner. Writes to:
 *   users/{uid}/coupleId
 *   couples/{cid}/{members,partners,createdAt}
 *   inviteCodes/{code}
 */
export async function createCoupleAndInvite(
  uid: string,
  displayName: string,
): Promise<CreateCoupleResult> {
  const coupleId = newCoupleId();
  const inviteCode = generateInviteCode();
  const now = Date.now();
  const expiresAt = now + INVITE_CODE_TTL_MS;

  const initialPartner: PartnerState = {
    name: displayName,
    ...DEFAULT_PARTNER_STATE,
    lastUpdated: now,
  };

  // Multi-location update — atomic from the client's perspective.
  await update(ref(db), {
    [`users/${uid}/coupleId`]: coupleId,
    [`couples/${coupleId}/members/${uid}`]: true,
    [`couples/${coupleId}/createdAt`]: serverTimestamp(),
    [`couples/${coupleId}/partners/${uid}`]: initialPartner,
    [`couples/${coupleId}/activeInviteCode`]: inviteCode,
    [`couples/${coupleId}/activeInviteExpiresAt`]: expiresAt,
    [`inviteCodes/${inviteCode}`]: {
      coupleId,
      createdBy: uid,
      createdAt: serverTimestamp(),
      expiresAt,
      redeemed: false,
    },
  });

  return { coupleId, inviteCode, expiresAt };
}

/**
 * Issue a fresh invite code for an existing couple (e.g. previous code
 * expired or was lost). Caller must already be a member.
 */
export async function regenerateInviteCode(
  coupleId: string,
  uid: string,
): Promise<{ inviteCode: string; expiresAt: number }> {
  const inviteCode = generateInviteCode();
  const expiresAt = Date.now() + INVITE_CODE_TTL_MS;

  await update(ref(db), {
    [`inviteCodes/${inviteCode}`]: {
      coupleId,
      createdBy: uid,
      createdAt: serverTimestamp(),
      expiresAt,
      redeemed: false,
    },
    [`couples/${coupleId}/activeInviteCode`]: inviteCode,
    [`couples/${coupleId}/activeInviteExpiresAt`]: expiresAt,
  });

  return { inviteCode, expiresAt };
}

export type RedeemInviteError =
  | 'invalid_format'
  | 'not_found'
  | 'already_redeemed'
  | 'expired'
  | 'self_redeem';

/**
 * Redeem an invite code on behalf of `uid`. Adds the user to the couple's
 * members and creates their partner subtree. Uses a transaction on the
 * invite-code doc so two simultaneous redemptions can't both succeed.
 *
 * Note: we don't enforce a 2-member couple cap client-side. The new rules
 * intentionally hide `couples/{cid}/members` from non-members (read-gated by
 * membership), so reading the count before joining would hang on permission-
 * denied. The single-use invite code is the practical guarantee — a second
 * code would have to be issued explicitly via regenerateInviteCode.
 */
export async function redeemInviteCode(
  rawCode: string,
  uid: string,
  displayName: string,
): Promise<{ coupleId: string } | { error: RedeemInviteError }> {
  const code = normalizeInviteCode(rawCode);
  if (!isValidInviteCode(code)) {
    return { error: 'invalid_format' };
  }

  const inviteRef = ref(db, `inviteCodes/${code}`);

  let abortReason: 'not_found' | 'already_redeemed' | 'self_redeem' | 'expired' | null = null;

  const tx = await runTransaction(inviteRef, (current) => {
    if (current === null) {
      abortReason = 'not_found';
      return current;
    }
    if (current.createdBy === uid) {
      abortReason = 'self_redeem';
      return current;
    }
    if (current.redeemed) {
      abortReason = 'already_redeemed';
      return current;
    }
    if (typeof current.expiresAt === 'number' && current.expiresAt < Date.now()) {
      abortReason = 'expired';
      return current;
    }
    abortReason = null;
    current.redeemed = true;
    current.redeemedBy = uid;
    current.redeemedAt = Date.now();
    return current;
  });

  if (abortReason) return { error: abortReason };
  if (!tx.committed || !tx.snapshot.exists()) return { error: 'not_found' };

  const after = tx.snapshot.val();
  const coupleId: string = after.coupleId;

  const now = Date.now();
  const partner: PartnerState = {
    name: displayName,
    ...DEFAULT_PARTNER_STATE,
    lastUpdated: now,
  };

  await update(ref(db), {
    [`users/${uid}/coupleId`]: coupleId,
    [`couples/${coupleId}/members/${uid}`]: true,
    [`couples/${coupleId}/partners/${uid}`]: partner,
    [`couples/${coupleId}/activeInviteCode`]: null,
    [`couples/${coupleId}/activeInviteExpiresAt`]: null,
  });

  return { coupleId };
}
