import React, { useState } from 'react';
import {
  BookOpen,
  PenTool,
  Layers,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Scissors,
  Volume2,
} from 'lucide-react';
import { DictionaryEntry, LookupStatus, ToneColoredPinyin, HskLevelBadge } from '@/modules/dictionary';
import { HanziWriterCanvas } from '@/modules/stroke-writer';
import { getRadicalInfo, getCompounds } from '../rules';

export interface HudLingoesContentProps {
  entry: DictionaryEntry | null;
  status: LookupStatus;
  targetText: string;
  activeWord: string;
  tokens: Array<{ word: string; isPunctuation: boolean }>;
  onSelectWord: (word: string) => void;
  onPlayAudio: (text: string) => void;
}

export const HudLingoesContent: React.FC<HudLingoesContentProps> = ({
  entry,
  status,
  targetText,
  activeWord,
  tokens,
  onSelectWord,
  onPlayAudio,
}) => {
  const [openCore, setOpenCore] = useState(true);
  const [openStroke, setOpenStroke] = useState(true);
  const [openCompounds, setOpenCompounds] = useState(true);
  const [openExamples, setOpenExamples] = useState(true);

  const displayWord = activeWord || targetText;
  const isSingleChar = entry ? entry.simplified.length === 1 : displayWord.length === 1;
  const radicalInfo = isSingleChar ? getRadicalInfo(entry?.simplified || displayWord) : null;
  const compounds = getCompounds(entry?.simplified || displayWord);

  const meaningfulTokens = tokens.filter((t) => !t.isPunctuation);

  return (
    <div className="space-y-3">
      {/* 1. THANH PHÂN ĐOẠN CÂU JIEBA (Nếu bôi đen câu hoặc cụm nhiều từ) */}
      {meaningfulTokens.length > 1 && (
        <div className="bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1.5 overflow-x-auto text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Scissors className="w-3 h-3 text-blue-600" /> Tách từ:
          </span>
          <div className="flex items-center gap-1 font-cjk">
            {meaningfulTokens.map((t, idx) => {
              const isSelected = t.word === displayWord;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectWord(t.word)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs scale-105'
                      : 'bg-white hover:bg-blue-100/70 text-slate-700 border border-slate-200'
                  }`}
                >
                  {t.word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. NỘI DUNG TRA CỨU TỪ ĐIỂN */}
      {entry ? (
        <div className="space-y-3">
          {/* SECTION 1: TỪ ĐIỂN TRUNG - VIỆT CHÍNH (HyDict Core) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
            <button
              type="button"
              className="w-full bg-slate-50 hover:bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none transition-colors text-left"
              onClick={() => setOpenCore(!openCore)}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Từ điển Trung - Việt (HyDict Core)</span>
              </div>
              {openCore ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openCore && (
              <div className="p-3.5 space-y-3">
                {/* Header chữ Hán, Pinyin & Hán Việt (Bố cục 2 hàng chuẩn từ điển, chống gãy dòng) */}
                <div className="border-b border-slate-100 pb-2.5 space-y-1.5">
                  {/* Hàng 1: Chữ Hán đại tự + HSK Badge + Pinyin đổi màu + Từ loại */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <span className="text-3xl font-black text-slate-900 font-cjk tracking-wide whitespace-nowrap shrink-0">
                        {entry.simplified}
                      </span>
                      <HskLevelBadge word={entry.simplified} />
                      <ToneColoredPinyin
                        pinyin={entry.pinyin}
                        className="text-sm font-semibold font-mono whitespace-nowrap"
                      />
                    </div>
                    {entry.pos && (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap border border-slate-200/60">
                        {entry.pos}
                      </span>
                    )}
                  </div>

                  {/* Hàng 2: Âm Hán Việt + Chữ Phồn thể trên hàng riêng biệt, rộng rãi, tuyệt đối không gãy dòng */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.hanViet && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap inline-flex items-center gap-1 shadow-2xs">
                        <span className="text-emerald-600 font-normal">Hán Việt:</span>
                        <span>{entry.hanViet.replace(/^Hán Việt:\s*/i, '')}</span>
                      </span>
                    )}
                    {entry.traditional && (
                      <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0 whitespace-nowrap">
                        Phồn thể: <span className="font-cjk font-bold text-slate-700">{entry.traditional}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Danh sách định nghĩa phân tầng đánh số */}
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  {entry.definitions.map((def, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-blue-600 shrink-0 text-xs mt-0.5">
                        {idx + 1}.
                      </span>
                      <span>{def}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CHIẾT TỰ & BÚT THUẬN (Nếu là chữ Hán đơn) */}
          {isSingleChar && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <button
                type="button"
                className="w-full bg-slate-50 hover:bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none transition-colors text-left"
                onClick={() => setOpenStroke(!openStroke)}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chiết tự & Quy tắc bút thuận</span>
                  {radicalInfo && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {radicalInfo.strokeCount} nét
                    </span>
                  )}
                </div>
                {openStroke ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openStroke && (
                <div className="p-3 flex items-center justify-around gap-4 bg-slate-50/40">
                  {/* Khung animation nét viết HanziWriter */}
                  <div className="shrink-0">
                    <HanziWriterCanvas character={entry.simplified} size={100} />
                  </div>

                  {/* Phân tích bộ thủ chi tiết */}
                  {radicalInfo && (
                    <div className="text-xs space-y-1.5 flex-1 pl-3 border-l border-slate-200/80">
                      <div>
                        <span className="text-slate-400 text-[11px]">Bộ thủ chính:</span>
                        <div className="font-bold text-slate-800 font-cjk flex items-center gap-1.5 mt-0.5">
                          <span className="text-base text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {radicalInfo.radical}
                          </span>
                          <span>{radicalInfo.name}</span>
                        </div>
                      </div>
                      <div className="text-slate-600 text-[11px] leading-snug">
                        {radicalInfo.meaning}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: TỪ GHÉP & CỤM TỪ PHỔ BIẾN (Compounds) */}
          {compounds.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <button
                type="button"
                className="w-full bg-slate-50 hover:bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none transition-colors text-left"
                onClick={() => setOpenCompounds(!openCompounds)}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Từ ghép phổ biến & Cụm từ liên quan</span>
                </div>
                {openCompounds ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openCompounds && (
                <div className="p-3 space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    {compounds.map((comp, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectWord(comp.word)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200/70 cursor-pointer transition-colors"
                      >
                        <div className="font-bold text-slate-900 font-cjk flex items-center justify-between">
                          <span>{comp.word}</span>
                          <span className="text-[10px] text-blue-600 font-normal font-mono">
                            {comp.pinyin}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {comp.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: CÂU VÍ DỤ SONG NGỮ (Bilingual Examples) */}
          {entry.examples && entry.examples.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <button
                type="button"
                className="w-full bg-slate-50 hover:bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none transition-colors text-left"
                onClick={() => setOpenExamples(!openExamples)}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Câu ví dụ thực tế song ngữ</span>
                </div>
                {openExamples ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openExamples && (
                <div className="p-3 space-y-2.5">
                  <div className="space-y-2 text-xs">
                    {entry.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-cjk font-bold text-slate-900 text-sm">
                            {ex.chinese}
                          </span>
                          <button
                            type="button"
                            onClick={() => onPlayAudio(ex.chinese)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                            title="Nghe ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <ToneColoredPinyin pinyin={ex.pinyin} className="text-[11px] font-mono" />
                        <div className="text-xs text-slate-600">{ex.vietnamese}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : status === 'loading' ? (
        <div className="p-8 text-center text-sm text-blue-500 font-medium animate-pulse bg-slate-50 rounded-2xl border border-slate-200">
          Đang tra cứu từ vựng tiếng Trung...
        </div>
      ) : displayWord ? (
        <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <p className="font-semibold text-slate-800">
            Chưa tìm thấy từ &quot;{displayWord}&quot;
          </p>
          <p className="text-xs text-slate-400">
            Vui lòng kiểm tra lại bôi đen hoặc nhập từ khác vào ô tìm kiếm nhanh phía trên
          </p>
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <p className="text-slate-600 font-semibold">Cửa sổ tra nhanh Lingoes Quick Lookup</p>
          <p className="text-xs text-slate-400">
            Bôi đen chữ hoặc câu tiếng Trung và bấm{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-mono font-bold text-[11px] shadow-2xs">
              Alt+Q
            </kbd>{' '}
            hoặc{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-mono font-bold text-[11px] shadow-2xs">
              Ctrl+Q
            </kbd>{' '}
            để tra cứu tức thì
          </p>
        </div>
      )}

      {/* 3. FOOTER THANH TRẠNG THÁI GỌN GÀNG (TUYỆT ĐỐI KHÔNG CÓ NÚT ANKI) */}
      <div className="bg-slate-50 -mx-3.5 -mb-3.5 mt-2 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 select-none rounded-b-2xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng tra nhanh
          </span>
          <span>•</span>
          <span>
            Phím tắt:{' '}
            <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-700 text-[10px]">
              Ctrl+Q
            </kbd>{' '}
            / <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-700 text-[10px]">
              Alt+Q
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
