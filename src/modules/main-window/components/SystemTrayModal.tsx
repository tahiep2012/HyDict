import React from 'react';
import { Card, Button } from '@/components/ui';
import { BookOpen, Zap, Settings, X, Power } from 'lucide-react';

export interface SystemTrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMainTab: (tab: 'dict' | 'hotkey') => void;
  onOpenHud: () => void;
  onShowToast: (msg: string) => void;
}

export const SystemTrayModal: React.FC<SystemTrayModalProps> = ({
  isOpen,
  onClose,
  onOpenMainTab,
  onOpenHud,
  onShowToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <Card
        variant="default"
        rounded="2xl"
        className="w-full max-w-sm bg-white border border-slate-200 shadow-2xl p-4 space-y-3 animate-fadeIn"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="HyDict Logo"
              className="w-6 h-6 rounded-md object-contain shrink-0"
            />
            <span className="font-bold text-sm text-slate-800">Khay Hệ Thống (Taskbar Tray)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Mô phỏng menu ngữ cảnh khi click chuột phải vào biểu tượng ứng dụng ở góc dưới Taskbar:
        </p>

        <div className="space-y-1 text-xs">
          <button
            onClick={() => {
              onOpenMainTab('dict');
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors font-medium text-slate-700"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Mở Cửa Sổ Chính</span>
          </button>

          <button
            onClick={() => {
              onOpenHud();
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors font-medium text-slate-700"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Kích hoạt Cửa Sổ Nổi (Quick HUD)</span>
          </button>

          <button
            onClick={() => {
              onOpenMainTab('hotkey');
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors font-medium text-slate-700"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Cài Đặt Tính Năng...</span>
          </button>

          <div className="border-t border-slate-100 my-1"></div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
                import('@tauri-apps/api/core')
                  .then(({ invoke }) => invoke('exit_app'))
                  .catch(() => {});
              }
              onShowToast('🚪 Đang thoát hoàn toàn ứng dụng...');
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors font-medium"
          >
            <Power className="w-4 h-4 text-rose-500" />
            <span>Thoát Phần Mềm Hoàn Toàn</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
