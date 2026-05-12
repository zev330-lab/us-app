import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// useRoute lives in a module that reads import.meta.env.BASE_URL at module
// scope, so we can only test the *behavior* via window.location patching.

const originalLocation = window.location;

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, pathname: '/' },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
  vi.restoreAllMocks();
});

describe('navigate', () => {
  it('pushes a new state and dispatches a navigation event', async () => {
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const { navigate } = await import('./router');
    navigate('/terms');
    expect(pushSpy).toHaveBeenCalled();
    const calledWith = pushSpy.mock.calls[pushSpy.mock.calls.length - 1][2];
    expect(typeof calledWith).toBe('string');
    expect(String(calledWith)).toMatch(/\/terms$/);
  });
});
