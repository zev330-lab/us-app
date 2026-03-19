import { useRef, useCallback, useState, useEffect } from 'react';
import type { PartnerState, PartnerId } from '../types';
import { PARTNER_NAMES } from '../types';

const COOLDOWN_MS = 300_000; // 5 minutes
const SLIDER_THRESHOLD = 10; // minimum slider change to trigger notification

type BucketKey = 'deep' | 'warm' | 'balanced' | 'gentle' | 'space';

const BUCKET_LABELS: Record<BucketKey, string> = {
  deep: 'Deep Connection',
  warm: 'Feeling Good',
  balanced: 'Balanced',
  gentle: 'Thinking Mode',
  space: 'Heavy Thinking',
};

function getBucket(net: number): BucketKey {
  if (net >= 60) return 'deep';
  if (net >= 20) return 'warm';
  if (net >= -19) return 'balanced';
  if (net >= -59) return 'gentle';
  return 'space';
}

function getCommSuggestion(coupleNet: number): string {
  if (coupleNet >= 60) return 'Talk face to face';
  if (coupleNet >= 20) return 'Good time to talk';
  if (coupleNet >= -19) return 'Keep it light';
  if (coupleNet >= -59) return 'Just be present';
  return 'Give some gentle space';
}

function showNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/us-app/icons/icon-192.png',
      tag: 'us-' + Date.now(),
    });
  }
}

export function useNotifications(partnerId: PartnerId | null) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('us-notifications') === 'on';
  });

  const lastNotifiedFeeling = useRef<number | null>(null);
  const lastNotifiedTogether = useRef<boolean | null>(null);
  const lastNotifyTime = useRef(0);
  const lastBucket = useRef<BucketKey | null>(null);
  const initialized = useRef(false);

  const partnerName = partnerId
    ? PARTNER_NAMES[partnerId === 'zev' ? 'irit' : 'zev']
    : '';

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      setEnabled(true);
      localStorage.setItem('us-notifications', 'on');
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const result = await Notification.requestPermission();
    if (result === 'granted') {
      setEnabled(true);
      localStorage.setItem('us-notifications', 'on');
      return true;
    }
    return false;
  }, []);

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem('us-notifications', 'off');
      return;
    }
    await requestPermission();
  }, [enabled, requestPermission]);

  // Check if permission was revoked externally
  useEffect(() => {
    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      setEnabled(false);
      localStorage.setItem('us-notifications', 'off');
    }
  }, [enabled]);

  const checkPartnerChange = useCallback(
    (partnerState: PartnerState) => {
      if (!enabled || !partnerId) return;

      // Skip the very first data load — don't notify on app open
      if (!initialized.current) {
        lastNotifiedFeeling.current = partnerState.feeling;
        lastNotifiedTogether.current = partnerState.together;
        initialized.current = true;
        return;
      }

      const now = Date.now();

      // Together/apart change — always notify (no cooldown)
      if (
        lastNotifiedTogether.current !== null &&
        partnerState.together !== lastNotifiedTogether.current &&
        document.hidden
      ) {
        showNotification(
          partnerName,
          partnerName +
            (partnerState.together ? ' switched to Together' : ' is now Apart')
        );
        lastNotifiedTogether.current = partnerState.together;
        lastNotifiedFeeling.current = partnerState.feeling;
        lastNotifyTime.current = now;
        return;
      }
      lastNotifiedTogether.current = partnerState.together;

      // Slider change — requires threshold + cooldown
      if (lastNotifiedFeeling.current !== null) {
        const diff = Math.abs(
          partnerState.feeling - lastNotifiedFeeling.current
        );
        const cooldownPassed = now - lastNotifyTime.current > COOLDOWN_MS;

        if (diff >= SLIDER_THRESHOLD && cooldownPassed && document.hidden) {
          showNotification(
            partnerName,
            `${partnerName} is at ${partnerState.feeling}% feeling`
          );
          lastNotifiedFeeling.current = partnerState.feeling;
          lastNotifyTime.current = now;
        }
      }
    },
    [enabled, partnerId, partnerName]
  );

  const checkBucketChange = useCallback(
    (coupleNet: number) => {
      if (!enabled) return;

      const newBucket = getBucket(coupleNet);

      if (!lastBucket.current) {
        lastBucket.current = newBucket;
        return;
      }

      if (newBucket !== lastBucket.current && document.hidden) {
        showNotification(
          'Us',
          `${BUCKET_LABELS[newBucket]} — ${getCommSuggestion(coupleNet)}`
        );
        lastBucket.current = newBucket;
      } else {
        lastBucket.current = newBucket;
      }
    },
    [enabled]
  );

  return {
    enabled,
    supported: typeof window !== 'undefined' && 'Notification' in window,
    denied:
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'denied',
    toggle,
    checkPartnerChange,
    checkBucketChange,
  };
}
