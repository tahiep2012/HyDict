import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  actionButton?: React.ReactNode;
  onClear?: () => void;
  inputClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Tìm kiếm...',
      actionButton,
      className = '',
      inputClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div className={`relative flex items-center w-full ${className}`}>
        {/* Left Search Icon (20px standard) */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>

        {/* 48px Desktop Ergonomic Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full h-12 pl-11 ${
            actionButton ? (hasValue && onClear ? 'pr-36' : 'pr-28') : hasValue && onClear ? 'pr-10' : 'pr-4'
          } bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName}`}
          {...props}
        />

        {/* Clear Button */}
        {hasValue && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className={`absolute ${
              actionButton ? 'right-28' : 'right-3'
            } top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer`}
            title="Xóa nội dung"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Right Action Button Slot */}
        {actionButton && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {actionButton}
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
