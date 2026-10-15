import React from 'react';
import {
  Pin,
  X,
  Sparkles,
  Volume2,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
} from 'lucide-react';

export interface HudTitlebarProps {
  title?: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
  className?: string;
  // Lingoes Toolbar Controls (Optional)
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
  onPlayAudio?: () => void;
  onHistoryBack?: () => void;
  onHistoryForward?: () => void;
  canHistoryBack?: boolean;
  canHistoryForward?: boolean;
  onCopyDefinition?: () => void;
  onOpenMainWindow?: () => void;
}

export const HudTitlebar: React.FC<HudTitlebarProps> = ({
  title = 'HyDict Quick Lookup',
  isPinned,
  onTogglePin,
  onClose,
  className = '',
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onPlayAudio,
  onHistoryBack,
  onHistoryForward,
  canHistoryBack = false,
  canHistoryForward = false,
  onCopyDefinition,
  onOpenMainWindow,
}) => {
  const isLingoesMode = searchTerm !== undefined || onSearchSubmit !== undefined;

  return (
    <div
      className={`bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 select-none ${className}`}
      data-tauri-drag-region
    >
      {isLingoesMode ? (
        <>
          {/* Nhóm trái: Ô tìm kiếm nhanh & Loa phát âm chuẩn Lingoes */}
          <div className="flex items-center gap-2 flex-1 min-w-0" data-tauri-drag-region="false">
            {onPlayAudio && (
              <button
                type="button"
                onClick={onPlayAudio}
                className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
                title="Phát âm từ vựng (Alt + P)"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="relative flex-1 min-w-[120px]">
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearchSubmit) {
                    onSearchSubmit(searchTerm || '');
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 font-cjk focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs pr-7"
                placeholder="Nhập chữ cần tra..."
              />
              {onSearchSubmit && (
                <button
                  type="button"
                  onClick={() => onSearchSubmit(searchTerm || '')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Tra cứu"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Nhóm phải: Lịch sử, Copy, Mở rộng, Ghim, Đóng */}
          <div className="flex items-center gap-1 shrink-0">
            {onHistoryBack && (
              <button
                type="button"
                onClick={onHistoryBack}
                disabled={!canHistoryBack}
                className={`p-1 rounded-md transition-colors ${
                  canHistoryBack
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Từ trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {onHistoryForward && (
              <button
                type="button"
                onClick={onHistoryForward}
                disabled={!canHistoryForward}
                className={`p-1 rounded-md transition-colors ${
                  canHistoryForward
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Từ kế tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onCopyDefinition && (
              <button
                type="button"
                onClick={onCopyDefinition}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                title="Sao chép toàn bộ giải nghĩa"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenMainWindow && (
              <button
                type="button"
                onClick={onOpenMainWindow}
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Xem chi tiết trên cửa sổ chính"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="w-px h-4 bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isPinned
                  ? 'text-blue-600 bg-blue-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
              }`}
              title={isPinned ? 'Bỏ ghim (Tự đóng)' : 'Ghim cửa sổ (Không tự đóng)'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>{title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPinned
                  ? 'text-blue-600 bg-blue-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
              }`}
              title={isPinned ? 'Bỏ ghim (Tự đóng)' : 'Ghim cửa sổ (Không tự đóng)'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
