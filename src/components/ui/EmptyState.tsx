import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  iconBg?: 'slate' | 'amber' | 'blue' | 'emerald' | 'rose';
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconBg = 'slate',
  title,
  description,
  action,
  className = '',
}) => {
  const iconBgStyles = {
    slate: 'bg-slate-100 text-slate-400',
    amber: 'bg-amber-50 text-amber-500',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-500',
  };

  return (
    <div
      className={`p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3 bg-white/40 ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-2xs ${iconBgStyles[iconBg]}`}
      >
        {icon}
      </div>
      <div className="text-sm font-bold text-slate-700">{title}</div>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
