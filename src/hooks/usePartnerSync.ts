import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, push } from 'firebase/database';
import { db } from '../firebase';
import type { PartnerId, PartnerState } from '../types';
import { COUPLE_ID, PARTNER_NAMES } from '../types';

const DEBOUNCE_MS = 300;

function getOtherPartner(id: PartnerId): PartnerId {
  return id === 'zev' ? 'irit' : 'zev';
}

const DEFAULT_STATE: PartnerState = {
  name: '',
  thinking: 50,
  feeling: 50,
  together: true,
  lastUpdated: Date.now(),
};

export function usePartnerSync(partnerId: PartnerId | null) {
  const [myState, setMyState] = useState<PartnerState>({ ...DEFAULT_STATE });
  const [partnerState, setPartnerState] = useState<PartnerState>({ ...DEFAULT_STATE });
  const [partnerUpdated, setPartnerUpdated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Listen to my own state
  useEffect(() => {
    if (!partnerId) return;
    const myRef = ref(db, `couples/${COUPLE_ID}/partners/${partnerId}`);
    const unsubscribe = onValue(myRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMyState(data);
      } else {
        // Initialize if doesn't exist
        const initial: PartnerState = {
          name: PARTNER_NAMES[partnerId],
          thinking: 50,
          feeling: 50,
          together: true,
          lastUpdated: Date.now(),
        };
        set(myRef, initial);
        setMyState(initial);
      }
      initialLoadDone.current = true;
    });
    return () => unsubscribe();
  }, [partnerId]);

  // Listen to partner's state
  useEffect(() => {
    if (!partnerId) return;
    const otherId = getOtherPartner(partnerId);
    const partnerRef = ref(db, `couples/${COUPLE_ID}/partners/${otherId}`);
    let firstLoad = true;
    const unsubscribe = onValue(partnerRef, (snapshot) => {
      if (snapshot.exists()) {
        setPartnerState(snapshot.val());
        if (!firstLoad) {
          setPartnerUpdated(true);
          setTimeout(() => setPartnerUpdated(false), 1500);
        }
        firstLoad = false;
      }
    });
    return () => unsubscribe();
  }, [partnerId]);

  // Update slider value (debounced write to Firebase)
  const updateSlider = useCallback((feeling: number) => {
    if (!partnerId) return;
    const thinking = 100 - feeling;
    setMyState(prev => ({ ...prev, thinking, feeling }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const myRef = ref(db, `couples/${COUPLE_ID}/partners/${partnerId}`);
      const now = Date.now();
      set(myRef, {
        name: PARTNER_NAMES[partnerId],
        thinking,
        feeling,
        together: myState.together,
        lastUpdated: now,
      });

      // Log history
      const historyRef = ref(db, `couples/${COUPLE_ID}/history`);
      const otherId = getOtherPartner(partnerId);
      push(historyRef, {
        [partnerId]: { thinking, feeling },
        [otherId]: { thinking: partnerState.thinking, feeling: partnerState.feeling },
        coupleNet: (feeling - thinking) + (partnerState.feeling - partnerState.thinking),
        together: { [partnerId]: myState.together, [otherId]: partnerState.together },
        timestamp: now,
      });
    }, DEBOUNCE_MS);
  }, [partnerId, myState.together, partnerState]);

  // Toggle together/apart
  const toggleTogether = useCallback(() => {
    if (!partnerId) return;
    const newTogether = !myState.together;
    setMyState(prev => ({ ...prev, together: newTogether }));
    const myRef = ref(db, `couples/${COUPLE_ID}/partners/${partnerId}`);
    set(myRef, {
      ...myState,
      together: newTogether,
      lastUpdated: Date.now(),
    });
  }, [partnerId, myState]);

  const otherPartnerId = partnerId ? getOtherPartner(partnerId) : null;

  return {
    myState,
    partnerState,
    partnerUpdated,
    otherPartnerId,
    updateSlider,
    toggleTogether,
  };
}
