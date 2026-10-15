import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export const MatchScoreBadge = ({ score, reasons = [], size = 'md' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Maintain required test classes while offering modern dark styling
  let badgeColor = 'bg-[#151915] text-emerald-700 dark:text-emerald-400 border border-[#282F28] hover:border-[#B7FF5A]/50';
  let dotColor = 'bg-[#B7FF5A]';

  if (score < 50) {
    badgeColor = 'bg-[#151915] text-slate-700 dark:text-slate-400 border border-[#282F28] hover:border-[#384238]';
    dotColor = 'bg-[#70796F]';
  } else if (score < 75) {
    badgeColor = 'bg-[#151915] text-blue-700 dark:text-blue-400 border border-[#282F28] hover:border-blue-500/40';
    dotColor = 'bg-blue-400';
  }

  const isSmall = size === 'sm';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip((prev) => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Match score ${score} percent`}
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all cursor-pointer ${
          isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        } ${badgeColor}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
        <span>{score}% Match</span>
        {reasons.length > 0 && <Info className="w-3 h-3 opacity-80" />}
      </button>

      {/* Explainable reasons popup */}
      {showTooltip && reasons.length > 0 && (
        <div className="absolute z-40 left-0 mt-2 w-72 p-3.5 bg-[#151915] border border-[#282F28] rounded-xl shadow-elevated text-left animate-fade-in pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F7F2] mb-2 pb-1.5 border-b border-[#282F28]">
            <Sparkles className="w-3.5 h-3.5 text-[#B7FF5A]" />
            <span>Why this recommendation?</span>
          </div>
          <ul className="space-y-1.5">
            {reasons.map((r, i) => (
              <li
                key={i}
                className="text-xs text-[#A1AAA0] flex items-start gap-2"
              >
                <span className="text-[#B7FF5A] font-bold leading-none mt-0.5">•</span>
                <span className="leading-tight">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MatchScoreBadge;
