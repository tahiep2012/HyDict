import React, { forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      size = 'md',
      disabled = false,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'h-9 px-3 text-xs rounded-lg',
      md: 'h-11 px-3.5 text-xs rounded-xl',
      lg: 'h-12 px-4 text-sm rounded-2xl',
    };

    const paddingLeft = leftIcon ? (size === 'sm' ? 'pl-8' : 'pl-10') : '';
    const paddingRight = rightIcon ? (size === 'sm' ? 'pr-8' : 'pr-10') : '';

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="block font-bold text-xs text-slate-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`w-full bg-slate-50 border ${
              error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'
            } font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              sizeStyles[size]
            } ${paddingLeft} ${paddingRight} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-500 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-[11px] text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
