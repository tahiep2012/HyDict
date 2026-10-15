import React from 'react';
import { ExampleSentence } from '../types';
import { Volume2, BookMarked } from 'lucide-react';
import { ToneColoredPinyin } from './ToneColoredPinyin';

export interface ExampleListProps {
  examples: ExampleSentence[];
  onPlayAudio?: (text: string) => void;
  className?: string;
}

export const ExampleList: React.FC<ExampleListProps> = ({
  examples,
  onPlayAudio,
  className = '',
}) => {
  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
        <BookMarked className="w-3.5 h-3.5" />
        <span>Câu ví dụ thực tế</span>
      </div>

      <div className="space-y-2">
        {examples.map((ex, index) => (
          <div
            key={index}
            className="p-3 bg-white rounded-xl border border-slate-200/90 border-l-4 border-l-blue-600 shadow-xs relative group"
          >
            {onPlayAudio && (
              <button
                onClick={() => onPlayAudio(ex.chinese)}
                className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Nghe câu ví dụ"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="text-sm font-semibold text-slate-900 pr-6 font-cjk">
              {ex.chinese}
            </div>
            <div className="mt-0.5">
              <ToneColoredPinyin pinyin={ex.pinyin} className="text-xs font-mono font-medium" />
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {ex.vietnamese}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
