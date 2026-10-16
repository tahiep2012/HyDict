import React, { useState, useEffect, useRef } from 'react';
import { useDictionaryLookup } from '@/modules/dictionary';
import { useAudioPlayback } from '@/modules/tts-audio';
import { AddToAnkiButton } from '@/modules/anki-bridge';
import { BookmarkButton } from '@/modules/notebook';
import { HanziWriterCanvas } from '@/modules/stroke-writer';
import { Button, Card, Badge, SearchInput } from '@/components/ui';
import { Search, Volume2, Sparkles, Clock, Globe, BookOpen, Layers } from 'lucide-react';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { entry, lookup, status, multiResults, classification, selectEntry } =
    useDictionaryLookup(initialQuery);
  const isLoading = status === 'loading';
  const { playAudio } = useAudioPlayback();

  // Auto-suggestions khi gõ từ khóa
  useEffect(() => {
    const query = searchInput.trim();
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        import('@tauri-apps/api/core')
          .then(({ invoke }) => {
            invoke<string[]>('search_suggestions', { query })
              .then((suggs) => {
                if (suggs && suggs.length > 0) {
                  setSuggestions(suggs);
                } else {
                  setSuggestions([]);
                }
              })
              .catch(() => setSuggestions([]));
          })
          .catch(() => setSuggestions([]));
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Đóng suggestions khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    setShowSuggestions(false);
    lookup(searchInput.trim());
    onSelectWord(searchInput.trim());
    playAudio(searchInput.trim());
  };

  const handleSelectSuggestion = (suggestedWord: string) => {
    setSearchInput(suggestedWord);
    setShowSuggestions(false);
    lookup(suggestedWord);
    onSelectWord(suggestedWord);
    playAudio(suggestedWord);
  };

  const handleQuickWord = (word: string) => {
    setSearchInput(word);
    setShowSuggestions(false);
    lookup(word);
    onSelectWord(word);
    playAudio(word);
  };

  const getSourceBadge = () => {
    if (classification.type === 'vietnamese') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Globe className="w-3 h-3 text-emerald-600" />
          Khớp nghĩa tiếng Việt
        </span>
      );
    }
    if (classification.type === 'pinyin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Layers className="w-3 h-3 text-amber-600" />
          Khớp Pinyin không dấu
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <BookOpen className="w-3 h-3 text-blue-600" />
        Khớp Hán tự
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Tra Cứu Từ Điển Đa Chiều</h2>
          <p className="text-xs text-slate-500">
            Hỗ trợ tra chữ Hán, Pinyin không dấu (vd: <i>gongzuo</i>), và tra ngược tiếng Việt (vd: <i>bảo hiểm</i>, <i>sa thải</i>)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getSourceBadge()}
          <Badge variant="primary" size="md">
            122,500+ từ vựng
          </Badge>
        </div>
      </div>

      {/* Search Input Bar with Auto-suggestions */}
      <div className="relative" ref={suggestionsRef}>
        <form onSubmit={handleSearch}>
          <SearchInput
            value={searchInput}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowSuggestions(true);
            }}
            onClear={() => {
              setSearchInput('');
              setSuggestions([]);
            }}
            placeholder="Nhập chữ Hán (学习), Pinyin không dấu (gongzuo), hoặc tiếng Việt (bảo hiểm)..."
            actionButton={
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="rounded-xl shadow-xs"
              >
                Tra Cứu
              </Button>
            }
          />
        </form>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Gợi ý từ khóa phù hợp:
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-hanzi font-medium flex items-center justify-between transition-colors"
              >
                <span>{item}</span>
                <span className="text-xs text-slate-400 font-sans">Chọn để tra cứu &rarr;</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Multi-result candidate selection list (Tra ngược / Pinyin) */}
      {multiResults.length > 1 && (
        <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Tìm thấy {multiResults.length} từ vựng phù hợp:
            </span>
            <span className="text-[11px] font-semibold text-blue-600">
              Click vào thẻ để xem chi tiết
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {multiResults.map((item, idx) => {
              const isSelected = entry?.simplified === item.simplified;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    selectEntry(item);
                    playAudio(item.simplified);
                  }}
                  className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black font-hanzi text-base ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.simplified}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {item.pinyin}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] line-clamp-1 max-w-[210px] mt-1 font-medium ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {item.definitions[0] || item.hanViet}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Display */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-slate-400">Đang tìm kiếm trong kho 122,500+ từ vựng...</div>
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
                  {entry.hanViet}
                </Badge>
                {entry.pos && (
                  <Badge variant="purple" size="sm">
                    {entry.pos}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => playAudio(entry.simplified)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  title="Phát âm chữ Hán"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookmarkButton
                wordItem={{
                  word: entry.simplified,
                  pinyin: entry.pinyin,
                  hanViet: entry.hanViet,
                  definition: entry.definitions.join('; '),
                }}
                onToggle={(isSaved) =>
                  onShowToast(
                    isSaved
                      ? `⭐ Đã thêm [${entry.simplified}] vào Sổ tay từ yêu thích!`
                      : `🗑️ Đã xóa [${entry.simplified}] khỏi Sổ tay từ yêu thích`
                  )
                }
              />
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
          Không tìm thấy từ vựng phù hợp với từ khóa &ldquo;{searchInput}&rdquo;. Vui lòng thử từ khác.
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
