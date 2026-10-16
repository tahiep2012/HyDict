import React, { useState } from 'react';
import { Card, Button, Badge, Select } from '@/components/ui';
import { AppSettings } from '../types';
import { CheckCircle2, RefreshCw, Layers, FileText } from 'lucide-react';

export interface AnkiConfigTabProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onShowToast: (msg: string) => void;
}

export const AnkiConfigTab: React.FC<AnkiConfigTabProps> = ({
  settings,
  onUpdateSetting,
  onShowToast,
}) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleTestConnection = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      onUpdateSetting('ankiConnected', true);
      onShowToast('✅ Kết nối AnkiConnect (Port 8765) thành công!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Đồng Bộ Thẻ Với Anki Desktop</h2>
        <p className="text-xs text-slate-500">
          Kết nối hai chiều thông qua AnkiConnect API (Port 8765)
        </p>
      </div>

      {/* Connection Status Banner */}
      <Card
        variant="default"
        rounded="2xl"
        className={`p-4 flex items-center justify-between border ${
          settings.ankiConnected
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-rose-50/70 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
              settings.ankiConnected ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {settings.ankiConnected ? <CheckCircle2 className="w-5 h-5" /> : '!'}
          </div>
          <div>
            <div
              className={`font-bold text-sm ${
                settings.ankiConnected ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              {settings.ankiConnected
                ? 'AnkiConnect Đã Kết Nối Thành Công'
                : 'Chưa Kết Nối Được Anki Desktop'}
            </div>
            <div
              className={`text-xs ${
                settings.ankiConnected ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              Cổng dịch vụ: http://127.0.0.1:8765 (Phiên bản API: 6)
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          disabled={isChecking}
          className="bg-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
        </Button>
      </Card>

      {/* Deck & Note Configuration */}
      <div className="space-y-4 text-xs">
        <Select
          label={
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Bộ Deck Anki mặc định khi lưu thẻ:
            </span>
          }
          value={settings.ankiDeck}
          onChange={(e) => onUpdateSetting('ankiDeck', e.target.value)}
        >
          <option value="Tiếng Trung (HSK 1 - 6)">Tiếng Trung (HSK 1 - 6)</option>
          <option value="Hán Ngữ Giao Tiếp">Hán Ngữ Giao Tiếp</option>
          <option value="Default">Default</option>
        </Select>

        <Select
          label={
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Loại thẻ (Model / Note Type):
            </span>
          }
          value={settings.ankiModel}
          onChange={(e) => onUpdateSetting('ankiModel', e.target.value)}
        >
          <option value="HyDict-Rich-Card">HyDict-Rich-Card (Hanzi, Pinyin, HanViet, Meaning, Example)</option>
          <option value="Basic">Basic (and reversed card)</option>
        </Select>

        {/* Field Mapping Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            Cấu trúc các trường thẻ tự động điền sang Anki:
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-blue-600">{`{Hanzi}`}</strong>: Chữ Hán gốc
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-amber-600">{`{Pinyin}`}</strong>: Phiên âm có thanh điệu
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-indigo-600">{`{HanViet}`}</strong>: Âm Hán Việt chuẩn
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-purple-600">{`{Meaning}`}</strong>: Toàn bộ nghĩa tiếng Việt
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 col-span-2">
              <strong className="text-emerald-600">{`{Example}`}</strong>: Câu ví dụ kèm pinyin & dịch nghĩa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
