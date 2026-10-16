import React, { forwardRef } from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'ghost' | 'bordered' | 'danger' | 'primary' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95';

    const sizeStyles = {
      sm: 'w-7 h-7 p-1',
      md: 'w-8 h-8 p-1.5',
      lg: 'w-9 h-9 p-2',
    };

    const variantStyles = {
      ghost:
        'text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-blue-400',
      danger:
        'text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 focus-visible:ring-rose-400',
      bordered:
        'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus-visible:ring-slate-300 shadow-2xs',
      primary:
        'text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 shadow-xs shadow-blue-600/20',
      light:
        'text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
