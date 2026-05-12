import { useEffect, useCallback, useState } from 'react';
import { Settings as SettingsIcon, Bell, BellOff, Copy, Check } from 'lucide-react';
import { navigate } from '../lib/router';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useAuthContext } from '../context/AuthContext';
import { usePartnerSync } from '../hooks/usePartnerSync';
import { useSuggestions } from '../hooks/useSuggestions';
import { useNotifications } from '../hooks/useNotifications';
import { useUpdateDot } from '../hooks/useUpdateDot';
import { regenerateInviteCode } from '../services/coupling';
import type { PartnerState as PartnerStateType } from '../types';
import Slider from './Slider';
import PartnerState from './PartnerState';
import CoupleScore from './CoupleScore';
import StatusToggle from './StatusToggle';
import CommMode from './CommMode';
import Suggestions from './Suggestions';

export default function Dashboard() {
  const { user, userDoc, coupleId } = useAuthContext();

  const uid = user!.uid;
  const myName = userDoc!.displayName;

  const { showDot, markUpdate, clearDot } = useUpdateDot();

  const [pendingPartnerChange, setPendingPartnerChange] = useState<PartnerStateType | null>(null);

  const onPartnerChange = useCallback(
    (state: PartnerStateType) => {
      setPendingPartnerChange(state);
      markUpdate();
    },
    [markUpdate],
  );

  const {
    myState,
    partnerState,
    partnerUid,
    partnerUpdated,
    updateSlider,
    toggleTogether,
  } = usePartnerSync(coupleId!, uid, myName, onPartnerChange);

  const isLinked = !!partnerState && !!partnerUid;
  const partnerName = partnerState?.name ?? 'your partner';

  const { enabled, supported, denied, toggle, checkPartnerChange, checkBucketChange } =
    useNotifications(partnerName);

  // Pipe partner-change events into the notifications hook now that it has a stable partnerName.
  useEffect(() => {
    if (pendingPartnerChange) {
      checkPartnerChange(pendingPartnerChange);
      setPendingPartnerChange(null);
    }
  }, [pendingPartnerChange, checkPartnerChange]);

  const handleSlider = useCallback(
    (feeling: number) => { clearDot(); updateSlider(feeling); },
    [clearDot, updateSlider],
  );

  const handleToggle = useCallback(() => {
    clearDot();
    toggleTogether();
  }, [clearDot, toggleTogether]);

  const coupleNet = isLinked
    ? (myState.feeling - myState.thinking) + (partnerState.feeling - partnerState.thinking)
    : 0;

  useEffect(() => {
    if (isLinked) checkBucketChange(coupleNet);
  }, [coupleNet, isLinked, checkBucketChange]);

  const bothTogether = isLinked && myState.together && partnerState.together;
  const { suggestions, refresh } = useSuggestions(coupleNet, bothTogether);

  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>
    <div className="max-w-md mx-auto min-h-screen flex flex-col">

      <header className="flex items-center justify-between px-6 pt-6 pb-3">
        <h1 className="text-4xl font-semibold italic text-text-primary relative"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Us
          {showDot && <span className="update-dot-sm absolute -top-0.5 -right-3" />}
        </h1>
        <div className="flex items-center gap-1">
          {supported && (
            <button
              onClick={toggle}
              className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-text-secondary/60 hover:text-text-primary"
              aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
              title={denied ? 'Notifications blocked — enable in browser settings' : enabled ? 'Notifications on' : 'Notifications off'}
            >
              {enabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-text-secondary/60 hover:text-text-primary"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      <div className="px-6 pt-2 pb-4 animate-fade-in stagger-1">
        <StatusToggle
          myState={myState}
          partnerState={partnerState}
          partnerName={partnerName}
          onToggle={handleToggle}
        />
      </div>

      <div className="mx-6 h-px bg-white/[0.06]" />

      <div className="flex-1 flex flex-col gap-5 px-5 py-6 pb-10">
        <div className="animate-fade-in stagger-2">
          <p className="section-label mb-3 px-1">Your State</p>
          <Slider feeling={myState.feeling} onChange={handleSlider} />
        </div>

        {isLinked ? (
          <>
            <div className="animate-fade-in stagger-3">
              <p className="section-label mb-3 px-1">Partner</p>
              <PartnerState
                state={partnerState}
                partnerName={partnerName}
                updated={partnerUpdated}
                showUpdateDot={showDot}
              />
            </div>

            <div className="animate-fade-in stagger-4">
              <p className="section-label mb-3 px-1">Us</p>
              <CoupleScore
                myState={myState}
                partnerState={partnerState}
                myName={myName}
                partnerName={partnerName}
              />
            </div>

            <div className="animate-fade-in stagger-5">
              <p className="section-label mb-3 px-1">How to Connect</p>
              <CommMode
                coupleNet={coupleNet}
                myTogether={myState.together}
                partnerTogether={partnerState.together}
              />
            </div>

            <div className="animate-fade-in stagger-6">
              <Suggestions suggestions={suggestions} onRefresh={refresh} />
            </div>
          </>
        ) : (
          <UnlinkedBanner coupleId={coupleId!} uid={uid} />
        )}
      </div>

      <div className="pb-8 flex justify-center">
        <div className="flex items-center gap-2 opacity-15">
          <div className="w-1.5 h-1.5 rounded-full bg-thinking" />
          <div className="w-1 h-1 rounded-full bg-blend" />
          <div className="w-1.5 h-1.5 rounded-full bg-feeling" />
        </div>
      </div>
    </div>
    </div>
  );
}

interface UnlinkedBannerProps { coupleId: string; uid: string; }

function UnlinkedBanner({ coupleId, uid }: UnlinkedBannerProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const codeRef = ref(db, `couples/${coupleId}/activeInviteCode`);
    const expRef = ref(db, `couples/${coupleId}/activeInviteExpiresAt`);
    const u1 = onValue(codeRef, (s) => setActiveCode(s.val()));
    const u2 = onValue(expRef, (s) => setExpiresAt(s.val()));
    return () => { u1(); u2(); };
  }, [coupleId]);

  const expired = !!expiresAt && Date.now() > expiresAt;
  const showCode = !!activeCode && !expired;

  const handleCopy = async () => {
    if (!activeCode) return;
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateInviteCode(coupleId, uid);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="animate-fade-in stagger-3">
      <p className="section-label mb-3 px-1">Link your partner</p>
      <div className="glass-card p-6 text-center">
        {showCode ? (
          <>
            <p className="text-text-secondary text-sm mb-4">
              Share this code with your partner. They enter it on their device to link.
            </p>
            <div className="py-6 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
              <p className="text-4xl font-mono tracking-[0.3em] text-accent"
                 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {activeCode}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08]
                           text-text-primary hover:bg-white/[0.08] transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex-1 py-3 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08]
                           text-text-secondary hover:bg-white/[0.08] disabled:opacity-50
                           transition-all duration-200"
              >
                {regenerating ? '…' : 'New code'}
              </button>
            </div>
            <p className="text-text-secondary/50 text-xs mt-4">
              Code expires in 24 hours.
            </p>
          </>
        ) : (
          <>
            <p className="text-text-secondary text-sm mb-4">
              {expired ? 'Your invite code has expired.' : "You don't have an active invite code."}
            </p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="w-full py-3 rounded-xl font-medium text-sm text-bg-deep
                         bg-gradient-to-r from-accent to-[#d4b87a] hover:brightness-110
                         disabled:opacity-50 transition-all duration-200"
            >
              {regenerating ? 'Generating…' : 'Generate invite code'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
