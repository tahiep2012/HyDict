import React from 'react';
import { DictionaryEntry } from '../types';
import { Badge } from '@/components/ui';
import { Volume2 } from 'lucide-react';
import { ToneColoredPinyin } from './ToneColoredPinyin';
import { HskLevelBadge } from './HskLevelBadge';

export interface DefinitionCardProps {
  entry: DictionaryEntry;
  onPlayAudio?: (text: string) => void;
  className?: string;
}

export const DefinitionCard: React.FC<DefinitionCardProps> = ({
  entry,
  onPlayAudio,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Word Hero */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <h1 className="text-5xl font-extrabold text-blue-900 tracking-wide font-cjk">
            {entry.simplified}
          </h1>
          <HskLevelBadge word={entry.simplified} className="self-start mt-2 text-xs" />
        </div>
        {entry.traditional && (
          <span className="text-xs text-slate-400 font-cjk">
            Phồn thể: {entry.traditional}
          </span>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <div className="px-2.5 py-1 bg-amber-50/80 border border-amber-200/80 rounded-lg shadow-2xs inline-flex items-center">
            <ToneColoredPinyin pinyin={entry.pinyin} className="text-xs font-mono font-semibold" />
          </div>
          <Badge variant="success">{entry.hanViet}</Badge>
          {entry.pos && <Badge variant="purple">{entry.pos}</Badge>}
          {onPlayAudio && (
            <button
              onClick={() => onPlayAudio(entry.simplified)}
              className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xs cursor-pointer"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Definitions Box */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-sm text-slate-700 space-y-2 leading-relaxed">
        {entry.definitions.map((def, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="font-bold text-slate-900 shrink-0">{idx + 1}.</span>
            <span>{def}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
