import type { PartnerState as PartnerStateType, PartnerId } from '../types';
import { PARTNER_NAMES } from '../types';

interface PartnerStateProps {
  state: PartnerStateType;
  partnerId: PartnerId;
  updated: boolean;
  showUpdateDot?: boolean;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PartnerState({ state, partnerId, updated, showUpdateDot }: PartnerStateProps) {
  const name = PARTNER_NAMES[partnerId];
  const feelingPct = state.feeling;

  return (
    <div className={`glass-card p-5 transition-all duration-300 relative ${updated ? 'animate-gentle-pulse' : ''}`}>
      {showUpdateDot && (
        <span className="update-dot absolute -top-1 -right-1" />
      )}
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-medium text-text-primary">{name}</span>
        <span className="text-xs text-text-secondary/70">updated {timeAgo(state.lastUpdated)}</span>
      </div>

      {/* Mini slider visualization (read-only) */}
      <div className="relative h-[6px] rounded-full overflow-hidden mb-4"
           style={{
             background: 'linear-gradient(to right, #3B7DD8 0%, #6B7FBA 30%, #9B6B9E 50%, #C8717A 70%, #E8727A 100%)',
             opacity: 0.5,
           }}>
        {/* Position indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-all duration-500 ease-out"
          style={{
            left: `calc(${feelingPct}% - 8px)`,
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.3), 0 1px 4px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>

      {/* Percentages */}
      <div className="flex justify-between text-sm tabular-nums">
        <span className="text-thinking/80">{state.thinking}% thinking</span>
        <span className="text-feeling/80">{state.feeling}% feeling</span>
      </div>
    </div>
  );
}
