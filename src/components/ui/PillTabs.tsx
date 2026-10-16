import React from 'react';

export interface PillTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface PillTabsProps<T extends string = string> {
  tabs: PillTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function PillTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  size = 'sm',
  className = '',
}: PillTabsProps<T>) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
  };

  return (
    <div
      className={`inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center font-bold select-none cursor-pointer transition-all duration-150 ${
              sizeStyles[size]
            } ${
              isActive
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.icon && (
              <span className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="shrink-0">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
