import { useState, useCallback, useMemo } from 'react';
import { suggestionsByBucket } from '../data/suggestions';
import { getBucket } from '../lib/scoring';

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useSuggestions(coupleNet: number, bothTogether: boolean) {
  const [refreshKey, setRefreshKey] = useState(0);

  const bucket = useMemo(() => getBucket(coupleNet), [coupleNet]);

  const suggestions = useMemo(() => {
    const all = suggestionsByBucket[bucket];
    const filtered = all.filter(s => {
      if (bothTogether) {
        return s.context === 'together' || s.context === 'both';
      } else {
        return s.context === 'apart' || s.context === 'both';
      }
    });
    return shuffle(filtered).slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, bothTogether, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return { suggestions, bucket, refresh };
}
