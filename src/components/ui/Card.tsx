import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'bordered' | 'hud' | 'dashed';
  rounded?: 'xl' | '2xl' | '3xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  rounded = '2xl',
  className = '',
  ...props
}) => {
  const roundedStyles = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-xs',
    flat: 'bg-slate-50 border border-slate-200/60',
    bordered: 'bg-white border-2 border-slate-200',
    hud: 'bg-white border border-slate-200 shadow-hud',
    dashed: 'bg-white/40 border-2 border-dashed border-slate-200',
  };

  return (
    <div
      className={`${roundedStyles[rounded]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
