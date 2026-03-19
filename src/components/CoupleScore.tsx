import type { PartnerState, PartnerId } from '../types';
import { PARTNER_NAMES } from '../types';

interface CoupleScoreProps {
  myState: PartnerState;
  partnerState: PartnerState;
  myId: PartnerId;
  partnerId: PartnerId;
}

function getLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 60) return { label: 'Deep Connection', emoji: '💕', color: '#E8727A' };
  if (score >= 20) return { label: 'Feeling Good', emoji: '✨', color: '#E8727A' };
  if (score >= -19) return { label: 'Balanced', emoji: '🌊', color: '#C9A96E' };
  if (score >= -59) return { label: 'Thinking Mode', emoji: '🤔', color: '#4A90D9' };
  return { label: 'Heavy Thinking', emoji: '💭', color: '#4A90D9' };
}

export default function CoupleScore({ myState, partnerState, myId, partnerId }: CoupleScoreProps) {
  const mySurplus = myState.feeling - myState.thinking;
  const partnerSurplus = partnerState.feeling - partnerState.thinking;
  const coupleNet = mySurplus + partnerSurplus;
  const { label, emoji, color } = getLabel(coupleNet);

  // Map coupleNet from [-200, 200] to [0, 100] for the gauge
  const gaugePosition = ((coupleNet + 200) / 400) * 100;

  // Glow color for indicator
  const gaugeGlow = coupleNet > 0
    ? `rgba(232, 114, 122, ${0.3 + (coupleNet / 200) * 0.5})`
    : coupleNet < 0
    ? `rgba(74, 144, 217, ${0.3 + (Math.abs(coupleNet) / 200) * 0.5})`
    : 'rgba(201, 169, 110, 0.4)';

  // Subtle card tint
  const cardTint = coupleNet > 30
    ? 'rgba(232, 114, 122, 0.03)'
    : coupleNet < -30
    ? 'rgba(74, 144, 217, 0.03)'
    : 'rgba(255, 255, 255, 0.04)';

  return (
    <div className="glass-card p-6 transition-colors duration-700" style={{ background: cardTint }}>
      {/* Score and label */}
      <div className="text-center mb-5">
        <div className="mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          <span className="tabular-nums font-normal text-[3.5rem] leading-none transition-colors duration-500"
                style={{ color }}>
            {coupleNet > 0 ? '+' : ''}{coupleNet}
          </span>
        </div>
        <p className="text-base text-text-secondary">
          {emoji} {label}
        </p>
      </div>

      {/* Gauge */}
      <div className="relative h-3 rounded-full overflow-hidden mb-5"
           style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-25 rounded-full"
             style={{ background: 'linear-gradient(to right, #3B7DD8, #9B6B9E 50%, #E8727A)' }} />
        {/* Center tick */}
        <div className="absolute left-1/2 top-0 w-px h-full bg-white/25" />
        {/* Position indicator */}
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-500 ease-out"
             style={{
               left: `calc(${gaugePosition}% - 10px)`,
               background: color,
               boxShadow: `0 0 14px ${gaugeGlow}`,
             }} />
      </div>

      {/* Individual breakdown */}
      <div className="flex justify-between text-xs text-text-secondary/80 tabular-nums">
        <span>
          {PARTNER_NAMES[myId]}: <span style={{ color: mySurplus > 0 ? '#E8727A' : '#4A90D9' }}>
            {mySurplus > 0 ? '+' : ''}{mySurplus}
          </span>{' '}
          {mySurplus > 0 ? 'feeling' : mySurplus < 0 ? 'thinking' : 'even'}
        </span>
        <span>
          {PARTNER_NAMES[partnerId]}: <span style={{ color: partnerSurplus > 0 ? '#E8727A' : '#4A90D9' }}>
            {partnerSurplus > 0 ? '+' : ''}{partnerSurplus}
          </span>{' '}
          {partnerSurplus > 0 ? 'feeling' : partnerSurplus < 0 ? 'thinking' : 'even'}
        </span>
      </div>
    </div>
  );
}
