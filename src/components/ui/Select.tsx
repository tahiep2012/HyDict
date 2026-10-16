import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      children,
      className = '',
      containerClassName = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="block font-bold text-xs text-slate-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            className={`w-full h-11 pl-3.5 pr-10 bg-slate-50 border ${
              error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'
            } rounded-xl font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:bg-slate-100/80 appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
