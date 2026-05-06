import { describe, it, expect } from 'vitest';
import { getCoupleNet, getBucket, BUCKET_LABELS, BUCKETS } from './scoring';

describe('getCoupleNet', () => {
  it('returns +200 when both partners are 100% feeling', () => {
    expect(getCoupleNet(100, 100)).toBe(200);
  });

  it('returns -200 when both partners are 0% feeling (100% thinking)', () => {
    expect(getCoupleNet(0, 0)).toBe(-200);
  });

  it('returns 0 when both partners are at the 50/50 midpoint', () => {
    expect(getCoupleNet(50, 50)).toBe(0);
  });

  it('returns 0 when partners offset each other', () => {
    expect(getCoupleNet(100, 0)).toBe(0);
    expect(getCoupleNet(0, 100)).toBe(0);
    expect(getCoupleNet(75, 25)).toBe(0);
  });

  it('handles asymmetric mixes', () => {
    // Zev 90F, Irit 60F — both feeling-heavy
    // = (180-100) + (120-100) = 80 + 20 = 100
    expect(getCoupleNet(90, 60)).toBe(100);
    // Zev 10F (90T), Irit 40F (60T) — both thinking-heavy
    // = (20-100) + (80-100) = -80 + -20 = -100
    expect(getCoupleNet(10, 40)).toBe(-100);
  });
});

describe('getBucket', () => {
  it('classifies boundary cases correctly', () => {
    expect(getBucket(-200)).toBe('space');
    expect(getBucket(-100)).toBe('space');
    expect(getBucket(-60)).toBe('space');
    expect(getBucket(-59)).toBe('gentle');
    expect(getBucket(-20)).toBe('gentle');
    expect(getBucket(-19)).toBe('balanced');
    expect(getBucket(0)).toBe('balanced');
    expect(getBucket(19)).toBe('balanced');
    expect(getBucket(20)).toBe('warm');
    expect(getBucket(59)).toBe('warm');
    expect(getBucket(60)).toBe('deep');
    expect(getBucket(100)).toBe('deep');
    expect(getBucket(200)).toBe('deep');
  });

  it('classifies extreme values to the closest bucket (no fallback to balanced)', () => {
    // Regression: previous suggestionBuckets used min/max ranges that capped at
    // ±100, so coupleNet >100 or <-100 fell through to a "balanced" fallback.
    // Reads like a happy couple getting "Watch something together" when they
    // should be getting "Slow dance in the kitchen."
    expect(getBucket(150)).toBe('deep');
    expect(getBucket(199)).toBe('deep');
    expect(getBucket(-150)).toBe('space');
    expect(getBucket(-199)).toBe('space');
  });

  it('partitions the full coupleNet range across exactly 5 buckets', () => {
    const seen = new Set();
    for (let n = -200; n <= 200; n++) {
      seen.add(getBucket(n));
    }
    expect(seen.size).toBe(5);
    expect(seen).toEqual(new Set(BUCKETS));
  });
});

describe('BUCKET_LABELS', () => {
  it('has a label, emoji, and color for every bucket', () => {
    for (const bucket of BUCKETS) {
      const entry = BUCKET_LABELS[bucket];
      expect(entry.label).toBeTruthy();
      expect(entry.emoji).toBeTruthy();
      expect(entry.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('uses warm colors for positive buckets and cool for negative', () => {
    expect(BUCKET_LABELS.deep.color).toBe('#E8727A');
    expect(BUCKET_LABELS.warm.color).toBe('#E8727A');
    expect(BUCKET_LABELS.balanced.color).toBe('#C9A96E');
    expect(BUCKET_LABELS.gentle.color).toBe('#4A90D9');
    expect(BUCKET_LABELS.space.color).toBe('#4A90D9');
  });
});
