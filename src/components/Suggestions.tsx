import { RefreshCw } from 'lucide-react';
import type { Suggestion } from '../types';

interface SuggestionsProps {
  suggestions: Suggestion[];
  onRefresh: () => void;
}

export default function Suggestions({ suggestions, onRefresh }: SuggestionsProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="section-label">Suggestions</span>
        <button
          onClick={onRefresh}
          className="p-2 rounded-full hover:bg-white/5 active:bg-white/8 transition-colors text-text-secondary/60 hover:text-accent"
          aria-label="Refresh suggestions"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Cards */}
      {suggestions.map((s, i) => (
        <div
          key={`${s.text}-${i}`}
          className="glass-card px-5 py-4 flex items-start gap-4 transition-all duration-200 hover:bg-surface-hover active:scale-[0.99]"
        >
          <span className="text-2xl flex-shrink-0">{s.emoji}</span>
          <p className="text-sm text-text-primary/85 leading-relaxed pt-0.5">{s.text}</p>
        </div>
      ))}
    </div>
  );
}
