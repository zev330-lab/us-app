import type { PartnerState } from '../types';

interface StatusToggleProps {
  myState: PartnerState;
  partnerState: PartnerState | null;
  partnerName: string;
  onToggle: () => void;
}

export default function StatusToggle({ myState, partnerState, partnerName, onToggle }: StatusToggleProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Pill toggle */}
      <button
        onClick={onToggle}
        className="relative flex items-center w-[160px] h-10 rounded-full p-1 transition-all duration-300 border"
        style={{
          background: myState.together
            ? 'rgba(201, 169, 110, 0.12)'
            : 'rgba(255, 255, 255, 0.04)',
          borderColor: myState.together
            ? 'rgba(201, 169, 110, 0.25)'
            : 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          className="absolute top-1 h-8 w-[76px] rounded-full transition-all duration-300 ease-out"
          style={{
            left: myState.together ? '4px' : 'calc(100% - 80px)',
            background: myState.together
              ? 'rgba(201, 169, 110, 0.2)'
              : 'rgba(255, 255, 255, 0.06)',
          }}
        />
        <span className={`relative z-10 flex-1 text-center text-sm font-medium transition-colors duration-300 ${
          myState.together ? 'text-accent' : 'text-text-secondary/50'
        }`}>
          Together
        </span>
        <span className={`relative z-10 flex-1 text-center text-sm font-medium transition-colors duration-300 ${
          !myState.together ? 'text-text-primary/80' : 'text-text-secondary/50'
        }`}>
          Apart
        </span>
      </button>

      {/* Partner status */}
      {partnerState ? (
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${partnerState.together ? 'bg-accent/70' : 'bg-text-secondary/40'}`} />
          <span className="text-xs text-text-secondary">
            {partnerName} {partnerState.together ? 'together' : 'apart'}
          </span>
        </div>
      ) : (
        <span className="text-xs text-text-secondary/40 italic">unlinked</span>
      )}
    </div>
  );
}
