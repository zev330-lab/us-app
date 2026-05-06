import { describe, it, expect } from 'vitest';
import { getTogetherStatus, getCommRec, getProximitySuggestion } from './commMode';

describe('getTogetherStatus', () => {
  it('returns "together" only when both partners are together', () => {
    expect(getTogetherStatus(true, true)).toBe('together');
  });

  it('returns "apart" only when both partners are apart', () => {
    expect(getTogetherStatus(false, false)).toBe('apart');
  });

  it('returns "mixed" when partners disagree', () => {
    expect(getTogetherStatus(true, false)).toBe('mixed');
    expect(getTogetherStatus(false, true)).toBe('mixed');
  });
});

describe('getCommRec', () => {
  it('escalates to face-to-face when together and net is high', () => {
    expect(getCommRec(80, 'together').mode).toBe('Speak in person');
    expect(getCommRec(200, 'together').mode).toBe('Speak in person');
  });

  it('recommends gentle space when together but net is deeply negative', () => {
    expect(getCommRec(-100, 'together').mode).toBe('Gentle space');
    expect(getCommRec(-200, 'together').mode).toBe('Gentle space');
  });

  it('escalates to call/video when apart and net is high', () => {
    expect(getCommRec(80, 'apart').mode).toBe('Call / Video call');
    expect(getCommRec(200, 'apart').mode).toBe('Call / Video call');
  });

  it('advises light contact when apart and net is deeply negative', () => {
    expect(getCommRec(-100, 'apart').mode).toBe('No contact (with reassurance)');
    expect(getCommRec(-200, 'apart').mode).toBe('No contact (with reassurance)');
  });

  it('uses voice message in mixed status when net is high', () => {
    expect(getCommRec(50, 'mixed').mode).toBe('Voice message or call');
    expect(getCommRec(200, 'mixed').mode).toBe('Voice message or call');
  });

  it('recommends a balanced text in mixed status near zero', () => {
    expect(getCommRec(0, 'mixed').mode).toBe('Text');
    expect(getCommRec(-19, 'mixed').mode).toBe('Text');
    expect(getCommRec(19, 'mixed').mode).toBe('Text');
  });

  it('always returns a recommendation for any coupleNet in [-200, 200]', () => {
    for (const status of ['together', 'apart', 'mixed'] as const) {
      for (let n = -200; n <= 200; n++) {
        const rec = getCommRec(n, status);
        expect(rec.mode.length, `bucket gap at net=${n} status=${status}`).toBeGreaterThan(0);
        expect(rec.icon.length).toBeGreaterThan(0);
        expect(rec.message.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getProximitySuggestion', () => {
  it('suggests space when together but net is heavily negative', () => {
    expect(getProximitySuggestion(-60, 'together')).toContain('space');
    expect(getProximitySuggestion(-100, 'together')).toContain('space');
  });

  it('suggests reuniting when apart but net is high', () => {
    expect(getProximitySuggestion(60, 'apart')).toContain('great place');
    expect(getProximitySuggestion(40, 'apart')).toContain('see each other');
  });

  it('returns null in mixed status', () => {
    expect(getProximitySuggestion(100, 'mixed')).toBeNull();
    expect(getProximitySuggestion(-100, 'mixed')).toBeNull();
  });

  it('returns null when no proximity nudge applies', () => {
    expect(getProximitySuggestion(0, 'together')).toBeNull();
    expect(getProximitySuggestion(50, 'together')).toBeNull();
    expect(getProximitySuggestion(0, 'apart')).toBeNull();
    expect(getProximitySuggestion(-50, 'apart')).toBeNull();
  });
});
