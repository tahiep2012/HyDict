import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { AppSettings, MainWindowTab } from '../types';
import { DictLookupTab } from './DictLookupTab';
import { HotkeyCaptureTab } from './HotkeyCaptureTab';
import { AnkiConfigTab } from './AnkiConfigTab';
import { SystemSettingsTab } from './SystemSettingsTab';
import { SystemTrayModal } from './SystemTrayModal';
import { BookOpen, Zap, Settings, Layers, ExternalLink, Sparkles, Bookmark } from 'lucide-react';
import { NotebookTab } from '@/modules/notebook';

export interface MainWindowLayoutProps {
  activeTab: MainWindowTab;
  onSelectTab: (tab: MainWindowTab) => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  recentSearches: string[];
  onSelectWord: (word: string) => void;
  onShowToast: (msg: string) => void;
  onOpenQuickHud: () => void;
  isTrayModalOpen: boolean;
  onSetTrayModalOpen: (open: boolean) => void;
}

export const MainWindowLayout: React.FC<MainWindowLayoutProps> = ({
  activeTab,
  onSelectTab,
  settings,
  onUpdateSetting,
  recentSearches,
  onSelectWord,
  onShowToast,
  onOpenQuickHud,
  isTrayModalOpen,
  onSetTrayModalOpen,
}) => {
  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 select-none overflow-hidden">
      {/* Left Navigation Sidebar */}
      <aside className="w-60 bg-slate-50 border-r border-slate-200 p-4 flex flex-col justify-between select-none">
        <div className="space-y-1.5">
          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-2 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              汉
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 leading-tight">HyDict</div>
              <div className="text-[10px] text-slate-400 font-medium">Desktop Edition</div>
            </div>
          </div>

          <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Phân hệ chức năng
          </div>

          <button
            onClick={() => onSelectTab('dict')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'dict'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tra Cứu Từ Điển</span>
          </button>

          <button
            onClick={() => onSelectTab('notebook')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'notebook'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Sổ Từ & Lịch Sử</span>
          </button>

          <button
            onClick={() => onSelectTab('hotkey')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'hotkey'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Bắt Từ & Phím Tắt</span>
          </button>

          <button
            onClick={() => onSelectTab('anki')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'anki'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cấu Hình Anki</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Giọng Đọc & Khởi Động</span>
          </button>
        </div>

        {/* Bottom Quick Action Box */}
        <div className="space-y-2">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium text-[11px]">Trạng thái bắt từ:</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sẵn sàng
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Phím tắt:{' '}
              <kbd className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600 font-bold">
                {settings.globalHotkey}
              </kbd>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenQuickHud}
              className="w-full text-center text-[11px] py-1 h-auto"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Thử mở Quick HUD
            </Button>
          </div>

          <button
            onClick={() => onSetTrayModalOpen(true)}
            className="w-full text-center py-1.5 text-[11px] text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Xem menu Khay hệ thống
          </button>
        </div>
      </aside>

      {/* Right Content View */}
      <main className="flex-1 bg-white p-6 overflow-y-auto">
        {activeTab === 'dict' && (
          <DictLookupTab
            recentSearches={recentSearches}
            onSelectWord={onSelectWord}
            onShowToast={onShowToast}
          />
        )}
        {activeTab === 'notebook' && (
          <NotebookTab
            onSelectWord={(word) => {
              onSelectWord(word);
              onSelectTab('dict');
            }}
            onShowToast={onShowToast}
          />
        )}
        {activeTab === 'hotkey' && (
          <HotkeyCaptureTab
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            onShowToast={onShowToast}
          />
        )}
        {activeTab === 'anki' && (
          <AnkiConfigTab
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            onShowToast={onShowToast}
          />
        )}
        {activeTab === 'settings' && (
          <SystemSettingsTab
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            onShowToast={onShowToast}
          />
        )}
      </main>

      {/* System Tray Modal */}
      <SystemTrayModal
        isOpen={isTrayModalOpen}
        onClose={() => onSetTrayModalOpen(false)}
        onOpenMainTab={(tab) => onSelectTab(tab)}
        onOpenHud={onOpenQuickHud}
        onShowToast={onShowToast}
      />
    </div>
  );
};
