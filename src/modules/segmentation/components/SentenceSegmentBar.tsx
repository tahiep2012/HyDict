import React from 'react';
import { ChineseToken } from '../types';
import { Sparkles } from 'lucide-react';

export interface SentenceSegmentBarProps {
  tokens: ChineseToken[];
  activeWord: string;
  onSelectWord: (word: string) => void;
  className?: string;
}

export const SentenceSegmentBar: React.FC<SentenceSegmentBarProps> = ({
  tokens,
  activeWord,
  onSelectWord,
  className = '',
}) => {
  const meaningfulTokens = tokens.filter((t) => !t.isPunctuation && t.word.trim() !== '');

  if (meaningfulTokens.length === 0) {
    return null;
  }

  return (
    <div className={`p-3 bg-slate-50 rounded-2xl border border-slate-200/80 ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5 text-blue-600">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phân đoạn từ trong câu</span>
        </span>
        <span className="text-[10px] text-slate-400">Jieba CJK</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {meaningfulTokens.map((token, index) => {
          const isActive = token.word === activeWord;
          return (
            <button
              key={`${token.word}-${index}`}
              onClick={() => onSelectWord(token.word)}
              className={`px-3 py-1 text-xs font-medium rounded-xl transition-all duration-150 select-none ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/30 ring-2 ring-blue-400'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              {token.word}
            </button>
          );
        })}
      </div>
    </div>
  );
};
