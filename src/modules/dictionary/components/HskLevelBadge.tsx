import React from 'react';
import { HskLevel } from '../types';
import { getHskLevel } from '../rules/hskClassifier';

export interface HskLevelBadgeProps {
  level?: HskLevel | null;
  word?: string;
  className?: string;
}

export const HskLevelBadge: React.FC<HskLevelBadgeProps> = ({
  level,
  word,
  className = '',
}) => {
  const resolvedLevel = level !== undefined ? level : word ? getHskLevel(word) : null;

  if (!resolvedLevel) return null;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (resolvedLevel === 'HSK 1' || resolvedLevel === 'HSK 2') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
  } else if (resolvedLevel === 'HSK 3' || resolvedLevel === 'HSK 4') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50';
  } else if (resolvedLevel === 'HSK 5' || resolvedLevel === 'HSK 6') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border tracking-wide uppercase select-none shadow-xs ${colorClasses} ${className}`}
      title={`Cấp độ chuẩn: ${resolvedLevel}`}
    >
      {resolvedLevel}
    </span>
  );
};
