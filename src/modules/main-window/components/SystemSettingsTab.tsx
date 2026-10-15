import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { AppSettings } from '../types';
import { useAudioPlayback, AzureSpeechConfig } from '@/modules/tts-audio';
import { Volume2, Power, Mic, Sparkles, Key, Globe, CheckCircle2 } from 'lucide-react';

export interface SystemSettingsTabProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onShowToast: (msg: string) => void;
}

export const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({
  settings,
  onUpdateSetting,
  onShowToast,
}) => {
  const { playAudio } = useAudioPlayback();

  // Cấu hình Microsoft Azure Speech (tùy chọn)
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('eastus');
  const [hasAzureConfig, setHasAzureConfig] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hanzii_azure_speech');
      if (saved) {
        const parsed: AzureSpeechConfig = JSON.parse(saved);
        if (parsed.apiKey) {
          setAzureKey(parsed.apiKey);
          setAzureRegion(parsed.region || 'eastus');
          setHasAzureConfig(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveAzure = () => {
    if (!azureKey.trim()) {
      localStorage.removeItem('hanzii_azure_speech');
      setHasAzureConfig(false);
      onShowToast('ℹ️ Đã xóa Azure Speech Key, chuyển về Google TTS mặc định');
      return;
    }

    const config: AzureSpeechConfig = {
      apiKey: azureKey.trim(),
      region: azureRegion.trim() || 'eastus',
      voiceName: settings.ttsVoice,
    };
    localStorage.setItem('hanzii_azure_speech', JSON.stringify(config));
    setHasAzureConfig(true);
    onShowToast('✅ Đã lưu cấu hình Microsoft Azure Speech Neural Voices!');
  };

  const handleTestVoice = (voiceName: string, sampleWord: string) => {
    playAudio(sampleWord, { voice: settings.ttsVoice });
    onShowToast(`🔊 Đang phát giọng đọc mẫu: ${voiceName}`);
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Cài Đặt Giọng Đọc & Khởi Động</h2>
        <p className="text-xs text-slate-500">
          Tùy biến bộ máy phát âm Neural AI và hành vi khi mở máy tính Windows
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Auto start with Windows */}
        <Card variant="default" rounded="2xl" className="p-4 flex items-center justify-between border border-slate-200">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Power className="w-4 h-4 text-blue-600" />
              Khởi động cùng Windows (Auto Start)
            </div>
            <div className="text-slate-500">
              Tự động chạy ngầm dưới khay hệ thống (System Tray) khi bạn bật máy tính.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoStartWithWindows}
              onChange={(e) => {
                onUpdateSetting('autoStartWithWindows', e.target.checked);
                onShowToast(
                  e.target.checked
                    ? '✅ Đã bật tự khởi động cùng Windows'
                    : 'ℹ️ Đã tắt tự khởi động cùng Windows'
                );
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Card>

        {/* Voice Selection */}
        <Card variant="default" rounded="2xl" className="p-4 space-y-3 border border-slate-200">
          <div className="font-bold text-sm text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-600" />
              Giọng đọc phát âm AI (Neural Voices):
            </div>
            <span className="text-[11px] font-normal text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {hasAzureConfig ? 'Đang dùng: Azure Neural API' : 'Đang dùng: Google Translate Native TTS'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-xl flex items-center justify-between border-2 cursor-pointer transition-all ${
                settings.ttsVoice === 'zh-CN-XiaoxiaoNeural'
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="ttsVoice"
                  checked={settings.ttsVoice === 'zh-CN-XiaoxiaoNeural'}
                  onChange={() => onUpdateSetting('ttsVoice', 'zh-CN-XiaoxiaoNeural')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-bold text-slate-800">Xiaoxiao (Giọng Nữ)</div>
                  <div className="text-[11px] text-slate-500">Bắc Kinh - Tự nhiên, trầm ấm</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleTestVoice('Xiaoxiao', '你好，很高兴认识你。');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all"
                title="Nghe thử"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </label>

            <label
              className={`p-3 rounded-xl flex items-center justify-between border-2 cursor-pointer transition-all ${
                settings.ttsVoice === 'zh-CN-YunxiNeural'
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="ttsVoice"
                  checked={settings.ttsVoice === 'zh-CN-YunxiNeural'}
                  onChange={() => onUpdateSetting('ttsVoice', 'zh-CN-YunxiNeural')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-bold text-slate-800">Yunxi (Giọng Nam)</div>
                  <div className="text-[11px] text-slate-500">Chuẩn phát thanh viên</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleTestVoice('Yunxi', '你好，很高兴认识你。');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all"
                title="Nghe thử"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </label>
          </div>
        </Card>

        {/* Microsoft Azure Speech Service (Tùy chọn nâng cao) */}
        <Card variant="default" rounded="2xl" className="p-4 space-y-3 border border-slate-200">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              Microsoft Azure Speech Service (Tùy chọn nâng cao)
            </div>
            <p className="text-slate-500 leading-relaxed">
              Nếu bạn có Azure API Key miễn phí (F0 Free Tier tặng 500.000 ký tự/tháng), hãy dán vào đây để phát âm bằng giọng nơ-ron Xiaoxiao/Yunxi chính thức từ Microsoft. 
              <span className="text-blue-600 font-medium"> Mặc định để trống hệ thống tự động sử dụng Google Translate TTS chất lượng cao hoàn toàn miễn phí.</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Azure Subscription Key:</label>
              <input
                type="password"
                value={azureKey}
                onChange={(e) => setAzureKey(e.target.value)}
                placeholder="Nhập Azure Speech Key (để trống nếu không dùng)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Region:</label>
              <input
                type="text"
                value={azureRegion}
                onChange={(e) => setAzureRegion(e.target.value)}
                placeholder="eastus, southeastasia..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAzure}
              className="text-xs"
            >
              {azureKey.trim() ? 'Lưu cấu hình Azure' : 'Dùng mặc định (Google TTS)'}
            </Button>
          </div>
        </Card>

        {/* Autoplay on lookup */}
        <Card variant="default" rounded="2xl" className="p-4 flex items-center justify-between border border-slate-200">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tự động phát âm khi tra từ
            </div>
            <div className="text-slate-500">
              Mỗi khi bảng tra HUD xuất hiện sẽ tự động phát âm ngay lập tức.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.ttsAutoplay}
              onChange={(e) => onUpdateSetting('ttsAutoplay', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </Card>
      </div>
    </div>
  );
};
