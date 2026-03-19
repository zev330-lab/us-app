interface CommRecommendation {
  mode: string;
  icon: string;
  message: string;
}

type TogetherStatus = 'together' | 'apart' | 'mixed';

function getTogetherStatus(myTogether: boolean, partnerTogether: boolean): TogetherStatus {
  if (myTogether && partnerTogether) return 'together';
  if (!myTogether && !partnerTogether) return 'apart';
  return 'mixed';
}

const TOGETHER_RECS: { min: number; max: number; rec: CommRecommendation }[] = [
  { min: 60, max: 200, rec: { mode: 'Speak in person', icon: '🗣️', message: "Talk face to face. You're both open." } },
  { min: 20, max: 59, rec: { mode: 'Speak in person', icon: '💬', message: "Good time to talk. You're in a warm place." } },
  { min: -19, max: 19, rec: { mode: 'Talk (light)', icon: '🤫', message: 'Keep it light. Actions over words right now.' } },
  { min: -59, max: -20, rec: { mode: 'No talking needed', icon: '🤲', message: "Just be present. Words aren't needed." } },
  { min: -200, max: -60, rec: { mode: 'Gentle space', icon: '🚪', message: 'A little room to breathe. Stay close, stay quiet.' } },
];

const APART_RECS: { min: number; max: number; rec: CommRecommendation }[] = [
  { min: 60, max: 200, rec: { mode: 'Call / Video call', icon: '📞', message: 'Call each other. Hear the warmth.' } },
  { min: 20, max: 59, rec: { mode: 'Voice message', icon: '🎤', message: 'Send a voice note. Your voice matters more than words on a screen.' } },
  { min: -19, max: 19, rec: { mode: 'Text', icon: '💬', message: 'A sweet text. Keep it simple.' } },
  { min: -59, max: -20, rec: { mode: 'Short text', icon: '📱', message: "One loving text. Don't over-explain." } },
  { min: -200, max: -60, rec: { mode: 'No contact (with reassurance)', icon: '🕊️', message: "Give space. If you text, just say 'I love us. Take your time.'" } },
];

const MIXED_RECS: { min: number; max: number; rec: CommRecommendation }[] = [
  { min: 20, max: 200, rec: { mode: 'Voice message or call', icon: '📲', message: 'Reach out with your voice. Bridge the distance.' } },
  { min: -19, max: 19, rec: { mode: 'Text', icon: '💬', message: 'A text is enough right now.' } },
  { min: -200, max: -20, rec: { mode: 'Light text or wait', icon: '⏳', message: 'Wait for the right moment. A short text if you must.' } },
];

function getRec(coupleNet: number, status: TogetherStatus): CommRecommendation {
  const table = status === 'together' ? TOGETHER_RECS : status === 'apart' ? APART_RECS : MIXED_RECS;
  return table.find(r => coupleNet >= r.min && coupleNet <= r.max)?.rec
    ?? { mode: 'Be present', icon: '🌊', message: 'Just breathe. You have each other.' };
}

function getProximitySuggestion(coupleNet: number, status: TogetherStatus): string | null {
  if (status === 'mixed') return null;
  if (status === 'together') {
    if (coupleNet <= -60) return "🚪 It might be a good time to take some space. Come back when it feels right.";
    if (coupleNet <= -40) return "🌿 A little space might help right now. Even 20 minutes can reset things.";
  }
  if (status === 'apart') {
    if (coupleNet >= 60) return "✨ You're both in a great place. If there's any way to be together right now, go for it.";
    if (coupleNet >= 40) return "💫 If you can, try to see each other. No pressure — just if the stars align.";
  }
  return null;
}

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
  const { mode, icon, message } = getRec(coupleNet, status);
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
