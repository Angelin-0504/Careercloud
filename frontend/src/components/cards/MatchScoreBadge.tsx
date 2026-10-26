import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  isEligible?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  isEligible = true,
  size = 'md',
  showLabel = true,
  onClick,
}) => {
  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let badgeText = 'Strong Match';

  if (score >= 80) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    badgeText = 'Strong Match';
  } else if (score >= 60) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    badgeText = 'Good Match';
  } else if (score >= 40) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    badgeText = 'Moderate Fit';
  } else if (!isEligible) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeText = 'Review Fit';
  } else {
    colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
    badgeText = 'Low Match';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center rounded-full border transition-all ${colorClasses} ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:shadow-sm hover:scale-102 active:scale-98' : 'cursor-default'
      }`}
      title={isEligible ? `Compatibility Score: ${score}%` : 'Mandatory criteria not met'}
    >
      {isEligible ? (
        score >= 80 ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        )
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
      )}
      <span>{score}%</span>
      {showLabel && <span className="opacity-75 font-normal">({badgeText})</span>}
    </button>
  );
};
