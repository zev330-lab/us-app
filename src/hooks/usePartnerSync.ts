import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, update, push, serverTimestamp } from 'firebase/database';
import { db } from '../firebase';
import type { PartnerState } from '../types';

const DEBOUNCE_MS = 300;

const DEFAULT_STATE: PartnerState = {
  name: '',
  thinking: 50,
  feeling: 50,
  together: true,
  lastUpdated: 0,
};

interface PartnerSyncResult {
  myState: PartnerState;
  partnerState: PartnerState | null;
  partnerUid: string | null;
  partnerUpdated: boolean;
  updateSlider: (feeling: number) => void;
  toggleTogether: () => void;
}

/**
 * Realtime sync of the two partners' state for a given couple. The hook
 * subscribes to couples/{coupleId}/partners; whichever uid is not yours
 * is the partner. If the partner hasn't joined the couple yet, partnerState
 * and partnerUid are null.
 */
export function usePartnerSync(
  coupleId: string,
  uid: string,
  displayName: string,
  onPartnerChange?: (state: PartnerState) => void,
): PartnerSyncResult {
  const [myState, setMyState] = useState<PartnerState>({ ...DEFAULT_STATE, name: displayName });
  const [partnerState, setPartnerState] = useState<PartnerState | null>(null);
  const [partnerUid, setPartnerUid] = useState<string | null>(null);
  const [partnerUpdated, setPartnerUpdated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen to all partners in the couple; split into self vs. other.
  const onPartnerChangeRef = useRef(onPartnerChange);
  onPartnerChangeRef.current = onPartnerChange;
  const lastPartnerStateRef = useRef<PartnerState | null>(null);

  useEffect(() => {
    const partnersRef = ref(db, `couples/${coupleId}/partners`);
    let firstLoad = true;

    const unsubscribe = onValue(partnersRef, (snapshot) => {
      const data: Record<string, PartnerState> = snapshot.val() ?? {};
      const mine = data[uid];
      const otherUid = Object.keys(data).find((k) => k !== uid) ?? null;
      const other = otherUid ? data[otherUid] : null;

      if (mine) {
        setMyState(mine);
      } else {
        // First-time write: seed defaults so the slider has something to drive.
        const initial: PartnerState = {
          name: displayName,
          thinking: 50,
          feeling: 50,
          together: true,
          lastUpdated: Date.now(),
        };
        update(ref(db, `couples/${coupleId}/partners/${uid}`), initial).catch(() => {});
        setMyState(initial);
      }

      setPartnerUid(otherUid);
      setPartnerState(other);

      if (other && !firstLoad) {
        const prev = lastPartnerStateRef.current;
        const changed =
          !prev ||
          prev.feeling !== other.feeling ||
          prev.together !== other.together;
        if (changed) {
          setPartnerUpdated(true);
          setTimeout(() => setPartnerUpdated(false), 1500);
          onPartnerChangeRef.current?.(other);
        }
      }
      lastPartnerStateRef.current = other;
      firstLoad = false;
    });

    return () => unsubscribe();
  }, [coupleId, uid, displayName]);

  const updateSlider = useCallback(
    (feeling: number) => {
      const thinking = 100 - feeling;
      setMyState((prev) => ({ ...prev, thinking, feeling }));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const now = Date.now();
        const next: PartnerState = {
          name: displayName,
          thinking,
          feeling,
          together: myState.together,
          lastUpdated: now,
        };
        update(ref(db, `couples/${coupleId}/partners/${uid}`), next).catch(() => {});

        // Append history (best-effort; non-blocking).
        if (partnerState && partnerUid) {
          const historyEntry = {
            partners: {
              [uid]: { thinking, feeling },
              [partnerUid]: { thinking: partnerState.thinking, feeling: partnerState.feeling },
            },
            coupleNet:
              feeling - thinking + (partnerState.feeling - partnerState.thinking),
            together: {
              [uid]: myState.together,
              [partnerUid]: partnerState.together,
            },
            timestamp: serverTimestamp(),
          };
          push(ref(db, `couples/${coupleId}/history`), historyEntry).catch(() => {});
        }
      }, DEBOUNCE_MS);
    },
    [coupleId, uid, displayName, myState.together, partnerState, partnerUid],
  );

  const toggleTogether = useCallback(() => {
    const newTogether = !myState.together;
    setMyState((prev) => ({ ...prev, together: newTogether }));
    update(ref(db, `couples/${coupleId}/partners/${uid}`), {
      ...myState,
      together: newTogether,
      lastUpdated: Date.now(),
    }).catch(() => {});
  }, [coupleId, uid, myState]);

  return {
    myState,
    partnerState,
    partnerUid,
    partnerUpdated,
    updateSlider,
    toggleTogether,
  };
}
