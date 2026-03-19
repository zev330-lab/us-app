import { useEffect, useCallback } from 'react';
import { LogOut, Bell, BellOff } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { usePartnerSync } from '../hooks/usePartnerSync';
import { useSuggestions } from '../hooks/useSuggestions';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import type { PartnerState as PartnerStateType } from '../types';
import Slider from './Slider';
import PartnerState from './PartnerState';
import CoupleScore from './CoupleScore';
import StatusToggle from './StatusToggle';
import CommMode from './CommMode';
import Suggestions from './Suggestions';

export default function Dashboard() {
  const { partnerId } = useAuthContext();
  const { logout } = useAuth();
  const { enabled, supported, denied, toggle, checkPartnerChange, checkBucketChange } =
    useNotifications(partnerId);

  const onPartnerChange = useCallback(
    (state: PartnerStateType) => {
      checkPartnerChange(state);
    },
    [checkPartnerChange]
  );

  const {
    myState,
    partnerState,
    partnerUpdated,
    otherPartnerId,
    updateSlider,
    toggleTogether,
  } = usePartnerSync(partnerId, onPartnerChange);

  const coupleNet = (myState.feeling - myState.thinking) + (partnerState.feeling - partnerState.thinking);

  // Check bucket changes when coupleNet shifts
  useEffect(() => {
    checkBucketChange(coupleNet);
  }, [coupleNet, checkBucketChange]);
  const bothTogether = myState.together && partnerState.together;

  const { suggestions, refresh } = useSuggestions(coupleNet, bothTogether);

  if (!partnerId || !otherPartnerId) return null;

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-6 pb-3">
        <h1 className="text-4xl font-semibold italic text-text-primary"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Us
        </h1>
        <div className="flex items-center gap-1">
          {supported && (
            <button
              onClick={toggle}
              className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-text-secondary/60 hover:text-text-primary"
              aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
              title={
                denied
                  ? 'Notifications blocked — enable in browser settings'
                  : enabled
                  ? 'Notifications on'
                  : 'Notifications off'
              }
            >
              {enabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
          )}
          <button
            onClick={logout}
            className="p-2.5 rounded-full hover:bg-white/5 transition-colors text-text-secondary/60 hover:text-text-primary"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── Together / Apart ── */}
      <div className="px-6 pt-2 pb-4 animate-fade-in stagger-1">
        <StatusToggle
          myState={myState}
          partnerState={partnerState}
          partnerId={otherPartnerId}
          onToggle={toggleTogether}
        />
      </div>

      {/* ── Separator ── */}
      <div className="mx-6 h-px bg-white/[0.06]" />

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col gap-5 px-5 py-6 pb-10">

        {/* Your Slider */}
        <div className="animate-fade-in stagger-2">
          <p className="section-label mb-3 px-1">Your State</p>
          <Slider feeling={myState.feeling} onChange={updateSlider} />
        </div>

        {/* Partner State */}
        <div className="animate-fade-in stagger-3">
          <p className="section-label mb-3 px-1">Partner</p>
          <PartnerState
            state={partnerState}
            partnerId={otherPartnerId}
            updated={partnerUpdated}
          />
        </div>

        {/* Couple Score */}
        <div className="animate-fade-in stagger-4">
          <p className="section-label mb-3 px-1">Us</p>
          <CoupleScore
            myState={myState}
            partnerState={partnerState}
            myId={partnerId}
            partnerId={otherPartnerId}
          />
        </div>

        {/* Communication Mode */}
        <div className="animate-fade-in stagger-5">
          <p className="section-label mb-3 px-1">How to Connect</p>
          <CommMode
            coupleNet={coupleNet}
            myTogether={myState.together}
            partnerTogether={partnerState.together}
          />
        </div>

        {/* Suggestions */}
        <div className="animate-fade-in stagger-6">
          <Suggestions
            suggestions={suggestions}
            onRefresh={refresh}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pb-8 flex justify-center">
        <div className="flex items-center gap-2 opacity-15">
          <div className="w-1.5 h-1.5 rounded-full bg-thinking" />
          <div className="w-1 h-1 rounded-full bg-blend" />
          <div className="w-1.5 h-1.5 rounded-full bg-feeling" />
        </div>
      </div>
    </div>
  );
}
