import React from 'react';
import { parsePinyinToTokens, getToneColorClass } from '../rules/pinyinTone';

export interface ToneColoredPinyinProps {
  pinyin: string;
  className?: string;
  enabled?: boolean;
}

export const ToneColoredPinyin: React.FC<ToneColoredPinyinProps> = ({
  pinyin,
  className = '',
  enabled = true,
}) => {
  if (!pinyin) return null;

  if (!enabled) {
    return <span className={className}>{pinyin}</span>;
  }

  const tokens = parsePinyinToTokens(pinyin);

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {tokens.map((token, index) => {
        if (token.isPunctuation) {
          return (
            <span key={index} className="text-slate-400 select-none">
              {token.raw}
            </span>
          );
        }

        const colorClass = getToneColorClass(token.tone);

        return (
          <span key={index} className={`${colorClass} transition-colors duration-150`}>
            {token.raw}
          </span>
        );
      })}
    </span>
  );
};
