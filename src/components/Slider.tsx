import { useCallback } from 'react';

interface SliderProps {
  feeling: number;
  onChange: (feeling: number) => void;
}

export default function Slider({ feeling, onChange }: SliderProps) {
  const thinking = 100 - feeling;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const intensity = Math.abs(feeling - 50) / 50;

  // Color wash shifts based on position
  const washColor = feeling > 55
    ? `rgba(232, 114, 122, ${0.03 + intensity * 0.06})`
    : feeling < 45
    ? `rgba(74, 144, 217, ${0.03 + intensity * 0.06})`
    : 'transparent';


  return (
    <div className="glass-card p-6 transition-colors duration-700" style={{ background: washColor }}>
      {/* Labels */}
      <div className="flex justify-between items-end mb-5">
        <div className="text-left">
          <span className="text-[11px] uppercase tracking-widest text-text-secondary/70 block mb-1">Thinking</span>
          <p className={`tabular-nums transition-all duration-300`}
             style={{ color: '#4A90D9', fontSize: thinking >= feeling ? '1.875rem' : '1.5rem', opacity: thinking >= feeling ? 1 : 0.6 }}>
            {thinking}%
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-widest text-text-secondary/70 block mb-1">Feeling</span>
          <p className={`tabular-nums transition-all duration-300`}
             style={{ color: '#E8727A', fontSize: feeling >= thinking ? '1.875rem' : '1.5rem', opacity: feeling >= thinking ? 1 : 0.6 }}>
            {feeling}%
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="relative py-3">
        <input
          type="range"
          min={0}
          max={100}
          value={feeling}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      {/* Center marker */}
      <div className="flex justify-center mt-1">
        <div className="w-px h-2 bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
