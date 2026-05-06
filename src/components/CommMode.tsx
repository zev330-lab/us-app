import { getCommRec, getProximitySuggestion, getTogetherStatus } from '../lib/commMode';

function borderColor(coupleNet: number): string {
  if (coupleNet > 30) return 'rgba(232, 114, 122, 0.2)';
  if (coupleNet < -30) return 'rgba(74, 144, 217, 0.2)';
  return 'rgba(201, 169, 110, 0.15)';
}

interface CommModeProps {
  coupleNet: number;
  myTogether: boolean;
  partnerTogether: boolean;
}

export default function CommMode({ coupleNet, myTogether, partnerTogether }: CommModeProps) {
  const status = getTogetherStatus(myTogether, partnerTogether);
  const { mode, icon, message } = getCommRec(coupleNet, status);
  const proximity = getProximitySuggestion(coupleNet, status);

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-500 ease-out"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor(coupleNet)}`,
      }}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-base">{mode}</p>
          <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {proximity && (
        <p className="text-text-secondary/70 text-xs italic leading-relaxed mt-4 ml-[3.5rem] transition-opacity duration-500">
          {proximity}
        </p>
      )}
    </div>
  );
}
