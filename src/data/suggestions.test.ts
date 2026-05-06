import { describe, it, expect } from 'vitest';
import { suggestionsByBucket } from './suggestions';
import { BUCKETS } from '../lib/scoring';

describe('suggestionsByBucket', () => {
  it('has entries for every bucket', () => {
    for (const bucket of BUCKETS) {
      expect(suggestionsByBucket[bucket]).toBeDefined();
      expect(suggestionsByBucket[bucket].length).toBeGreaterThan(0);
    }
  });

  it('every bucket has at least one suggestion that surfaces when partners are together', () => {
    // Together filter accepts 'together' or 'both'.
    for (const bucket of BUCKETS) {
      const usable = suggestionsByBucket[bucket].filter(
        s => s.context === 'together' || s.context === 'both'
      );
      expect(usable.length, `bucket "${bucket}" has no together-context suggestions`).toBeGreaterThan(0);
    }
  });

  it('every bucket has at least one suggestion that surfaces when partners are apart', () => {
    // Apart filter accepts 'apart' or 'both'.
    for (const bucket of BUCKETS) {
      const usable = suggestionsByBucket[bucket].filter(
        s => s.context === 'apart' || s.context === 'both'
      );
      expect(usable.length, `bucket "${bucket}" has no apart-context suggestions`).toBeGreaterThan(0);
    }
  });

  it('every suggestion has non-empty text and emoji', () => {
    for (const bucket of BUCKETS) {
      for (const s of suggestionsByBucket[bucket]) {
        expect(s.text.length).toBeGreaterThan(0);
        expect(s.emoji.length).toBeGreaterThan(0);
        expect(['together', 'apart', 'both']).toContain(s.context);
      }
    }
  });

  it('does not contain any explicitly sexual content (App Review guideline 1.1.4)', () => {
    // Apple rejects relationship apps with explicit sexual suggestions.
    // Baseline check; expand list if reviewer flags more terms.
    const banned = /\b(sex|sexual|fuck|orgasm|naked|nude|porn)\b/i;
    for (const bucket of BUCKETS) {
      for (const s of suggestionsByBucket[bucket]) {
        expect(s.text, `suggestion "${s.text}" contains banned term`).not.toMatch(banned);
      }
    }
  });
});
