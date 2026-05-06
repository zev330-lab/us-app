import { describe, it, expect } from 'vitest';
import {
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
  INVITE_CODE_TTL_MS,
} from './inviteCode';

describe('generateInviteCode', () => {
  it('returns a 6-character code', () => {
    expect(generateInviteCode()).toHaveLength(6);
  });

  it('uses only the unambiguous alphabet (no 0/O, no 1/I/L)', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode();
      expect(code, `code "${code}" contains a banned character`).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/);
    }
  });

  it('produces different codes on successive calls', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) codes.add(generateInviteCode());
    // 50 codes should be unique with overwhelming probability (32^6 keyspace)
    expect(codes.size).toBe(50);
  });
});

describe('isValidInviteCode', () => {
  it('accepts well-formed codes', () => {
    expect(isValidInviteCode('ABCDEF')).toBe(true);
    expect(isValidInviteCode('XYZ234')).toBe(true);
    expect(isValidInviteCode('234567')).toBe(true);
  });

  it('rejects codes containing banned characters', () => {
    expect(isValidInviteCode('ABCDE0')).toBe(false); // 0
    expect(isValidInviteCode('ABCDEO')).toBe(false); // O
    expect(isValidInviteCode('ABCDE1')).toBe(false); // 1
    expect(isValidInviteCode('ABCDEI')).toBe(false); // I
    expect(isValidInviteCode('ABCDEL')).toBe(false); // L
  });

  it('rejects wrong-length codes', () => {
    expect(isValidInviteCode('ABCDE')).toBe(false);
    expect(isValidInviteCode('ABCDEFG')).toBe(false);
    expect(isValidInviteCode('')).toBe(false);
  });

  it('rejects lowercase codes (must be uppercased before validation)', () => {
    expect(isValidInviteCode('abcdef')).toBe(false);
  });
});

describe('normalizeInviteCode', () => {
  it('uppercases and strips whitespace', () => {
    expect(normalizeInviteCode('  abcdef  ')).toBe('ABCDEF');
    expect(normalizeInviteCode('xy z 234')).toBe('XYZ234');
  });

  it('removes any non-alphanumeric character (e.g. dashes someone added for readability)', () => {
    expect(normalizeInviteCode('ABC-DEF')).toBe('ABCDEF');
    expect(normalizeInviteCode('ABC.DEF')).toBe('ABCDEF');
  });
});

describe('INVITE_CODE_TTL_MS', () => {
  it('is 24 hours', () => {
    expect(INVITE_CODE_TTL_MS).toBe(86_400_000);
  });
});
