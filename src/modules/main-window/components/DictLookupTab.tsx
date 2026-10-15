import React, { useState } from 'react';
import { useDictionaryLookup } from '@/modules/dictionary';
import { useAudioPlayback } from '@/modules/tts-audio';
import { AddToAnkiButton } from '@/modules/anki-bridge';
import { HanziWriterCanvas } from '@/modules/stroke-writer';
import { Button, Card, Badge } from '@/components/ui';
import { Search, Volume2, Sparkles, Clock } from 'lucide-react';

export interface DictLookupTabProps {
  initialQuery?: string;
  recentSearches: string[];
  onSelectWord: (word: string) => void;
  onShowToast: (msg: string) => void;
}

export const DictLookupTab: React.FC<DictLookupTabProps> = ({
  initialQuery = '万里长城',
  recentSearches,
  onSelectWord,
  onShowToast,
}) => {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const { entry, lookup, status } = useDictionaryLookup(initialQuery);
  const isLoading = status === 'loading';
  const { playAudio } = useAudioPlayback();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    lookup(searchInput.trim());
    onSelectWord(searchInput.trim());
    playAudio(searchInput.trim());
  };

  const handleQuickWord = (word: string) => {
    setSearchInput(word);
    lookup(word);
    onSelectWord(word);
    playAudio(word);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Tra Cứu Từ Điển Chuyên Sâu</h2>
          <p className="text-xs text-slate-500">
            Tìm kiếm theo Hán tự, Pinyin hoặc nghĩa tiếng Việt trên kho từ SQLite FTS5
          </p>
        </div>
        <Badge variant="primary" size="md">
          120,000+ từ vựng
        </Badge>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Nhập chữ Hán (万, 学习), Pinyin (wan4), hoặc tiếng Việt..."
          className="w-full pl-11 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="absolute right-2 top-2 rounded-xl"
        >
          Tra Cứu
        </Button>
      </form>

      {/* Result Display */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-slate-400">Đang tìm kiếm...</div>
      ) : entry ? (
        <Card variant="default" rounded="2xl" className="p-5 space-y-4 border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black font-hanzi text-slate-900 tracking-wide">
                  {entry.simplified}
                </span>
                {entry.traditional && (
                  <span className="text-sm font-semibold text-slate-400">
                    Phồn thể: {entry.traditional}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="warning" size="sm">
                  {entry.pinyin}
                </Badge>
                <Badge variant="primary" size="sm">
                  Hán Việt: {entry.hanViet}
                </Badge>
                <Badge variant="purple" size="sm">
                  {entry.pos}
                </Badge>
                <button
                  type="button"
                  onClick={() => playAudio(entry.simplified)}
                  className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  title="Phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AddToAnkiButton
              fields={{
                Hanzi: entry.simplified,
                Pinyin: entry.pinyin,
                HanViet: entry.hanViet,
                Meaning: entry.definitions.join('; '),
                Example: entry.examples[0]?.chinese || '',
              }}
              onSuccess={() =>
                onShowToast(`✅ Đã thêm [${entry.simplified}] vào bộ thẻ Anki!`)
              }
            />
          </div>

          {/* Stroke Animation if single char */}
          {entry.simplified.length === 1 && (
            <div className="py-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Hoạt họa nét bút:
              </span>
              <HanziWriterCanvas character={entry.simplified} size={100} />
            </div>
          )}

          {/* Definitions */}
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
            <p className="font-bold text-slate-900">Giải nghĩa chi tiết:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {entry.definitions.map((def, idx) => (
                <li key={idx}>{def}</li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          {entry.examples.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Ví dụ ngữ cảnh thực tế:
              </span>
              <div className="space-y-2">
                {entry.examples.map((ex, idx) => (
                  <div key={idx} className="space-y-0.5 border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                    <div className="font-medium text-slate-900 font-hanzi text-sm flex items-center justify-between">
                      <span>{ex.chinese}</span>
                      <button
                        type="button"
                        onClick={() => playAudio(ex.chinese)}
                        className="text-slate-400 hover:text-blue-600 p-0.5"
                        title="Nghe câu"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-slate-500 italic text-[11px]">{ex.pinyin}</div>
                    <div className="text-slate-700 font-semibold">{ex.vietnamese}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="p-8 text-center text-sm text-slate-400">
          Không tìm thấy từ vựng. Vui lòng thử từ khác.
        </div>
      )}

      {/* Recent Searches */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Các từ đã tra gần đây:
        </h3>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((w, idx) => (
            <span
              key={idx}
              onClick={() => handleQuickWord(w)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
