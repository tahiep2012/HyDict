import React, { useState, useMemo } from 'react';
import {
  Star,
  Clock,
  Search,
  Trash2,
  Volume2,
  BookOpen,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useNotebook } from '../hooks/useNotebook';
import { filterFavorites, filterHistory } from '../rules';
import { FavoriteWordItem, SearchHistoryItem } from '../types';
import { Button, Card, Badge, SearchInput, EmptyState, IconButton, PillTabs } from '@/components/ui';
import { useAudioPlayback } from '@/modules/tts-audio';
import { ToneColoredPinyin, HskLevelBadge } from '@/modules/dictionary';

export interface NotebookTabProps {
  onSelectWord: (word: string) => void;
  onShowToast: (msg: string) => void;
}

export const NotebookTab: React.FC<NotebookTabProps> = ({
  onSelectWord,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'favorites' | 'history'>('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const { playAudio } = useAudioPlayback();

  const {
    favorites,
    history,
    removeFavorite,
    removeHistory,
    clearHistory,
  } = useNotebook();

  const filteredFavorites = useMemo(
    () => filterFavorites(favorites, searchQuery),
    [favorites, searchQuery]
  );

  const filteredHistory = useMemo(
    () => filterHistory(history, searchQuery),
    [history, searchQuery]
  );

  const formatDate = (ts: number) => {
    try {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')} - ${d.toLocaleDateString('vi-VN')}`;
    } catch {
      return '';
    }
  };

  const handleExportCsv = () => {
    if (favorites.length === 0) {
      onShowToast('⚠️ Danh sách yêu thích đang trống, không thể xuất.');
      return;
    }

    const rows = [
      ['Chữ Hán', 'Pinyin', 'Hán Việt', 'Giải nghĩa', 'Ngày lưu'].join('\t'),
      ...favorites.map((f) =>
        [f.word, f.pinyin, f.hanViet, f.definition.replace(/\n/g, ' '), formatDate(f.createdAt)].join(
          '\t'
        )
      ),
    ];
    const tsvContent = rows.join('\n');

    navigator.clipboard
      .writeText(tsvContent)
      .then(() => {
        onShowToast(`📋 Đã sao chép ${favorites.length} từ sang Clipboard (chuẩn bảng Anki / Excel)!`);
      })
      .catch(() => {
        onShowToast('⚠️ Không thể sao chép dữ liệu xuất');
      });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Sổ Tay Từ Vựng & Lịch Sử Tra Cứu</span>
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý kho từ yêu thích đã đánh dấu và xem lại các từ đã tra cứu gần đây
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <PillTabs<'favorites' | 'history'>
          tabs={[
            {
              id: 'favorites',
              label: `Từ Yêu Thích (${favorites.length})`,
              icon: (
                <Star
                  className={`w-3.5 h-3.5 ${
                    subTab === 'favorites' ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              ),
            },
            {
              id: 'history',
              label: `Lịch Sử (${history.length})`,
              icon: <Clock className="w-3.5 h-3.5" />,
            },
          ]}
          activeTab={subTab}
          onChange={setSubTab}
        />
      </div>

      {/* Standardized Search Bar & Actions Toolbar */}
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
        placeholder={
          subTab === 'favorites'
            ? 'Lọc theo chữ Hán, Pinyin, Hán Việt hoặc giải nghĩa...'
            : 'Lọc lịch sử tra cứu...'
        }
        actionButton={
          subTab === 'favorites' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="rounded-xl flex items-center gap-1.5 text-xs shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất sang CSV / Anki</span>
            </Button>
          ) : (
            history.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu?')) {
                    clearHistory();
                    onShowToast('🗑️ Đã xóa toàn bộ lịch sử tra cứu');
                  }
                }}
                className="rounded-xl flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Lịch Sử</span>
              </Button>
            )
          )
        }
      />

      {/* Content Area */}
      {subTab === 'favorites' ? (
        /* Favorites List */
        filteredFavorites.length === 0 ? (
          <EmptyState
            icon={<Star className="w-6 h-6 fill-amber-400 text-amber-500" />}
            iconBg="amber"
            title={searchQuery ? 'Không tìm thấy từ yêu thích phù hợp' : 'Chưa có từ vựng yêu thích nào'}
            description="Khi tra từ trên cửa sổ HUD hoặc tra từ điển chuyên sâu, bấm icon ngôi sao ⭐ để lưu lại các từ bạn muốn ghi nhớ."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => onSelectWord(item.word)}
                        className="text-2xl font-black font-cjk text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                        title="Bấm để tra cứu chi tiết"
                      >
                        {item.word}
                      </span>
                      <HskLevelBadge word={item.word} />
                      <IconButton
                        icon={<Volume2 className="w-3.5 h-3.5" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(item.word)}
                        title="Phát âm"
                      />
                    </div>

                    <IconButton
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        removeFavorite(item.id);
                        onShowToast(`🗑️ Đã xóa [${item.word}] khỏi từ yêu thích`);
                      }}
                      title="Xóa khỏi sổ tay"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="px-2 py-0.5 bg-amber-50 rounded border border-amber-200/60 inline-flex items-center">
                      <ToneColoredPinyin
                        pinyin={item.pinyin}
                        className="text-xs font-mono font-semibold"
                      />
                    </div>
                    {item.hanViet && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.hanViet}
                      </span>
                    )}
                  </div>

                  {item.definition && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.definition}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {formatDate(item.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectWord(item.word)}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Chi tiết</span>
                    <BookOpen className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History List */
        filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-6 h-6 text-slate-400" />}
            iconBg="slate"
            title={searchQuery ? 'Không tìm thấy lịch sử phù hợp' : 'Chưa có lịch sử tra cứu nào'}
            description="Mỗi khi bạn tra từ trên cửa sổ Quick HUD hoặc cửa sổ chính, từ vựng sẽ tự động được ghi nhận tại đây (lưu tối đa 100 từ)."
          />
        ) : (
          <Card variant="default" rounded="2xl" className="overflow-hidden divide-y divide-slate-100">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors gap-3 group"
              >
                <div
                  onClick={() => onSelectWord(item.word)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <span className="text-xl font-bold font-cjk text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.word}
                  </span>
                  <HskLevelBadge word={item.word} />
                  <ToneColoredPinyin
                    pinyin={item.pinyin}
                    className="text-xs font-mono font-medium text-slate-600"
                  />
                  {item.hanViet && (
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hidden sm:inline-block">
                      {item.hanViet}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden md:inline">
                    {formatDate(item.searchedAt)}
                  </span>
                  <IconButton
                    icon={<Volume2 className="w-3.5 h-3.5" />}
                    variant="ghost"
                    size="sm"
                    onClick={() => playAudio(item.word)}
                    title="Phát âm"
                  />
                  <IconButton
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    variant="danger"
                    size="sm"
                    onClick={() => removeHistory(item.id)}
                    title="Xóa khỏi lịch sử"
                  />
                </div>
              </div>
            ))}
          </Card>
        )
      )}
    </div>
  );
};
