import { useState, useEffect } from 'react';

const BASE = import.meta.env.BASE_URL || '/';

function normalizePath(): string {
  const raw = window.location.pathname;
  // Strip the deploy base prefix (e.g. "/us-app/" on GitHub Pages, "/" on Vercel).
  const stripped = raw.startsWith(BASE) ? '/' + raw.slice(BASE.length) : raw;
  return stripped.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

export function useRoute(): string {
  const [path, setPath] = useState<string>(() => normalizePath());

  useEffect(() => {
    const handler = () => setPath(normalizePath());
    window.addEventListener('popstate', handler);
    window.addEventListener('us-navigate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('us-navigate', handler);
    };
  }, []);

  return path;
}

export function navigate(to: string): void {
  // Prepend BASE so the URL bar shows the real deployed path.
  const fullPath = (BASE.endsWith('/') ? BASE.slice(0, -1) : BASE) + to;
  window.history.pushState(null, '', fullPath || '/');
  window.dispatchEvent(new Event('us-navigate'));
}
