import { useState, useCallback, useMemo } from 'react';
import { suggestionBuckets } from '../data/suggestions';
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

  const bucket = useMemo(() => {
    return suggestionBuckets.find(b => coupleNet >= b.min && coupleNet <= b.max)
      || suggestionBuckets[2]; // fallback to balanced
  }, [coupleNet]);

  const suggestions = useMemo(() => {
    // Filter by context
    const filtered = bucket.suggestions.filter(s => {
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

  return { suggestions, bucketLabel: bucket.label, refresh };
}
