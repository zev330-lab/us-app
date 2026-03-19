import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'us-partner-updated';
const AUTO_CLEAR_MS = 5000;

export function useUpdateDot() {
  const [showDot, setShowDot] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark update when app is hidden
  const markUpdate = useCallback(() => {
    if (document.hidden) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  // Clear the dot
  const clearDot = useCallback(() => {
    setShowDot(false);
    localStorage.removeItem(STORAGE_KEY);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Listen for visibility changes — show dot when returning to app
  useEffect(() => {
    function onVisible() {
      if (!document.hidden && localStorage.getItem(STORAGE_KEY) === 'true') {
        setShowDot(true);
        timerRef.current = setTimeout(() => {
          setShowDot(false);
          localStorage.removeItem(STORAGE_KEY);
          timerRef.current = null;
        }, AUTO_CLEAR_MS);
      }
    }

    document.addEventListener('visibilitychange', onVisible);
    // Also check on mount in case the app was just opened
    onVisible();

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { showDot, markUpdate, clearDot };
}
