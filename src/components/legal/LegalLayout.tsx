import { ArrowLeft } from 'lucide-react';
import { navigate } from '../../lib/router';
import type { ReactNode } from 'react';

interface LegalLayoutProps {
  title: string;
  effective: string;
  children: ReactNode;
}

export default function LegalLayout({ title, effective, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8 min-h-screen">
        <button
          onClick={() => { window.history.length > 1 ? window.history.back() : navigate('/'); }}
          className="inline-flex items-center gap-2 text-text-secondary/60 hover:text-text-primary text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <h1 className="text-3xl font-semibold italic text-text-primary mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h1>
        <p className="text-text-secondary/60 text-xs uppercase tracking-widest mb-8">
          Effective {effective}
        </p>

        <div className="legal-prose text-text-primary/80 leading-relaxed space-y-4 text-[15px]">
          {children}
        </div>

        <p className="text-text-secondary/40 text-xs mt-12 italic">
          Us — a project by Steinmetz Labs.
        </p>
      </div>
    </div>
  );
}
