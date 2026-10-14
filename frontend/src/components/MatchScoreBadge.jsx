import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export const MatchScoreBadge = ({ score, reasons = [], size = 'md' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Color gradient depending on score
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let dotColor = 'bg-emerald-500';

  if (score < 50) {
    badgeColor = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800';
    dotColor = 'bg-slate-400';
  } else if (score < 75) {
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    dotColor = 'bg-blue-500';
  }

  const isSmall = size === 'sm';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip((prev) => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
          isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        } ${badgeColor}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
        <span>{score}% Match</span>
        {reasons.length > 0 && <Info className="w-3 h-3 opacity-70" />}
      </button>

      {/* Explainable reasons popup */}
      {showTooltip && reasons.length > 0 && (
        <div className="absolute z-40 left-0 mt-2 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-left animate-fade-in pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Why this recommendation?</span>
          </div>
          <ul className="space-y-1.5">
            {reasons.map((r, i) => (
              <li
                key={i}
                className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5"
              >
                <span className="text-emerald-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MatchScoreBadge;
