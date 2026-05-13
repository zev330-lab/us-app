// 32-char alphabet: A-Z and 2-9, omitting visually ambiguous chars (0, O, 1, I, L).
// 32^6 ≈ 1.07 billion codes; collision risk is negligible at our scale.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_REGEX = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

export const INVITE_CODE_TTL_MS = 24 * 60 * 60 * 1000;

export function generateInviteCode(): string {
  let out = '';
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidInviteCode(code: string): boolean {
  return CODE_REGEX.test(code);
}

export function normalizeInviteCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}
