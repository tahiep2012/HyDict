import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { AppSettings, CaptureMode } from '../types';
import { Keyboard, MousePointer, Filter, Sparkles } from 'lucide-react';

export interface HotkeyCaptureTabProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onShowToast: (msg: string) => void;
}

export const HotkeyCaptureTab: React.FC<HotkeyCaptureTabProps> = ({
  settings,
  onUpdateSetting,
  onShowToast,
}) => {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(settings.globalHotkey);

  const handleSaveKey = () => {
    onUpdateSetting('globalHotkey', tempKey);
    setIsEditingKey(false);
    onShowToast(`⚡ Đã cập nhật phím tắt tra từ: ${tempKey}`);
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Cấu Hình Bắt Từ & Phím Tắt Toàn Cục</h2>
        <p className="text-xs text-slate-500">
          Thiết lập phương thức kích hoạt Popup HUD trên các ứng dụng bên ngoài (Word, Chrome, Anki...)
        </p>
      </div>

      {/* Global Hotkey Setting */}
      <Card variant="default" rounded="2xl" className="p-4 flex items-center justify-between border border-slate-200">
        <div className="space-y-1 max-w-md">
          <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-600" />
            Phím tắt toàn cục tra từ (Global Hotkey)
          </div>
          <div className="text-xs text-slate-500">
            Bôi đen từ ở bất kỳ phần mềm nào và bấm phím tắt này để mở bảng tra cứu tức thì.
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditingKey ? (
            <>
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Alt+Q"
                className="w-28 px-3 py-1.5 bg-white border border-blue-500 rounded-xl text-center text-xs font-bold text-blue-600 focus:outline-none"
              />
              <Button variant="primary" size="sm" onClick={handleSaveKey}>
                Lưu
              </Button>
            </>
          ) : (
            <>
              <span className="w-28 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-center text-xs font-bold text-blue-600 font-mono">
                {settings.globalHotkey}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingKey(true)}
              >
                Đổi phím
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Mouse Selection Mode */}
      <Card variant="default" rounded="2xl" className="p-4 space-y-3 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-indigo-600" />
              Bắt từ khi bôi đen chuột (Mouse Cursor Capture)
            </div>
            <div className="text-xs text-slate-500">
              Tự động phát hiện khi bạn vừa thả chuột bôi đen chữ Hán trên màn hình.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableCursorCapture}
              onChange={(e) => onUpdateSetting('enableCursorCapture', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sub-modes */}
        {settings.enableCursorCapture && (
          <div className="pl-4 border-l-2 border-blue-200 space-y-2 pt-2 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="captureMode"
                checked={settings.captureMode === 'bubble'}
                onChange={() => onUpdateSetting('captureMode', 'bubble')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Chỉ hiện biểu tượng bong bóng nhỏ cạnh chuột (Bấm vào mới bung Popup HUD - Tránh làm vướng)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="captureMode"
                checked={settings.captureMode === 'instant'}
                onChange={() => onUpdateSetting('captureMode', 'instant')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Hiện thẳng Popup HUD ngay lập tức khi thả chuột</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="captureMode"
                checked={settings.captureMode === 'alt_hold'}
                onChange={() => onUpdateSetting('captureMode', 'alt_hold')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>
                Chỉ bắt từ khi vừa bôi đen vừa giữ phím{' '}
                <kbd className="bg-slate-100 px-1.5 py-0.5 border rounded font-mono font-bold text-[11px]">Alt</kbd>
              </span>
            </label>
          </div>
        )}
      </Card>

      {/* CJK Filter */}
      <Card variant="default" rounded="2xl" className="p-4 flex items-center justify-between border border-slate-200">
        <div className="space-y-1 max-w-md">
          <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Lọc ký tự thông minh (Smart CJK Filter)
          </div>
          <div className="text-xs text-slate-500">
            Bỏ qua và không hiện bảng tra khi bạn bôi đen văn bản tiếng Anh thuần hoặc số điện thoại.
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.filterCjkOnly}
            onChange={(e) => onUpdateSetting('filterCjkOnly', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </Card>
    </div>
  );
};
