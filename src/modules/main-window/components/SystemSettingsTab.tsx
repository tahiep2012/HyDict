import React, { useState, useEffect } from 'react';
import { Card, Button, Switch, Select, Input } from '@/components/ui';
import { AppSettings } from '../types';
import { useAudioPlayback, AzureSpeechConfig, SUPPORTED_TTS_VOICES } from '@/modules/tts-audio';
import { Volume2, Power, Mic, Sparkles, Key, CheckCircle2, Sliders, Play, RotateCcw, XCircle } from 'lucide-react';

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
  const { playAudio, isPlaying, stopAudio } = useAudioPlayback();

  // Cấu hình Microsoft Azure Speech (tùy chọn)
  const [azureKey, setAzureKey] = useState('');
  const [azureRegion, setAzureRegion] = useState('eastus');
  const [hasAzureConfig, setHasAzureConfig] = useState(false);
  const [showAzureAdvanced, setShowAzureAdvanced] = useState(false);

  // Câu thử nghiệm giọng đọc
  const [testSentence, setTestSentence] = useState('你好，很高兴认识你。');

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
      onShowToast('ℹ️ Đã xóa Azure Speech Key, sử dụng Microsoft Edge Neural TTS miễn phí');
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

  const handleTestCurrentVoice = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    const currentVoiceObj = SUPPORTED_TTS_VOICES.find((v) => v.id === settings.ttsVoice);
    const voiceName = currentVoiceObj ? currentVoiceObj.name : settings.ttsVoice;
    playAudio(testSentence, {
      voice: settings.ttsVoice,
      rate: settings.ttsSpeed ?? 1.0,
    });
    onShowToast(`🔊 Đang phát: ${voiceName} (${settings.ttsSpeed ?? 1.0}x)`);
  };

  const getProviderBadge = () => {
    if (hasAzureConfig) {
      return (
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Azure Neural API Key
        </span>
      );
    }
    if (settings.ttsVoice === 'google-female') {
      return (
        <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Google Translate Native TTS
        </span>
      );
    }
    if (settings.ttsVoice === 'youdao-female') {
      return (
        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
          Youdao Dict TTS
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
        Microsoft Edge Neural (Miễn phí)
      </span>
    );
  };

  const currentSpeed = settings.ttsSpeed ?? 1.0;

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Cài Đặt Giọng Đọc & Khởi Động</h2>
        <p className="text-xs text-slate-500">
          Tùy biến bộ máy phát âm Neural AI thông minh và hành vi khi mở máy tính Windows
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Voice Selection & Tuning Dropdown */}
        <Card variant="default" rounded="2xl" className="p-4 space-y-4 border border-slate-200 shadow-sm">
          <div className="font-bold text-sm text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-600" />
              Chọn giọng đọc phát âm AI (Neural Voices):
            </div>
            {getProviderBadge()}
          </div>

          <div className="space-y-3">
            {/* Dropdown Menu */}
            <Select
              id="ttsVoiceSelect"
              label="Danh sách giọng đọc hỗ trợ:"
              value={settings.ttsVoice}
              onChange={(e) => {
                const newVoice = e.target.value;
                onUpdateSetting('ttsVoice', newVoice);
                const vObj = SUPPORTED_TTS_VOICES.find((v) => v.id === newVoice);
                if (vObj) {
                  onShowToast(`✅ Đã chuyển sang giọng: ${vObj.name}`);
                }
              }}
            >
              <optgroup label="👨 Giọng Nam Neural AI (Microsoft Edge)">
                {SUPPORTED_TTS_VOICES.filter((v) => v.group === 'neural_male').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.desc}
                  </option>
                ))}
              </optgroup>

              <optgroup label="👩 Giọng Nữ Neural AI (Microsoft Edge)">
                {SUPPORTED_TTS_VOICES.filter((v) => v.group === 'neural_female').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.desc}
                  </option>
                ))}
              </optgroup>

              <optgroup label="🌐 Nguồn phát âm dự phòng (Fallback Streams)">
                {SUPPORTED_TTS_VOICES.filter((v) => v.group === 'fallback').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.desc}
                  </option>
                ))}
              </optgroup>
            </Select>

            {/* Speed Tuning Slider */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Tốc độ đọc (Speech Rate):
                </span>
                <span className="font-mono text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  {currentSpeed.toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">0.75x</span>
                <input
                  type="range"
                  min="0.75"
                  max="1.50"
                  step="0.05"
                  value={currentSpeed}
                  onChange={(e) => onUpdateSetting('ttsSpeed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400">1.50x</span>

                <button
                  type="button"
                  onClick={() => onUpdateSetting('ttsSpeed', 1.0)}
                  title="Đặt lại tốc độ mặc định 1.0x"
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Voice Preview Tester */}
            <div className="pt-1 flex items-center gap-2">
              <Input
                size="sm"
                value={testSentence}
                onChange={(e) => setTestSentence(e.target.value)}
                placeholder="Nhập câu tiếng Trung để nghe thử..."
                containerClassName="flex-1"
              />
              <Button
                variant={isPlaying ? 'primary' : 'outline'}
                size="sm"
                onClick={handleTestCurrentVoice}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-pulse text-indigo-200" />
                    Đang phát...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                    Nghe thử giọng
                  </>
                )}
              </Button>
            </div>

            {/* Quick sentence chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400">Câu mẫu:</span>
              {[
                '你好，很高兴认识你。',
                '今天天气真好。',
                '学习汉语很有趣。',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setTestSentence(sample)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                    testSentence === sample
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Microsoft Azure Speech Service (Tùy chọn nâng cao) */}
        <Card variant="default" rounded="2xl" className="p-4 space-y-3 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              Microsoft Azure Speech Key (Tùy chọn nâng cao)
            </div>
            <button
              type="button"
              onClick={() => setShowAzureAdvanced(!showAzureAdvanced)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              {showAzureAdvanced ? 'Thu gọn' : 'Mở rộng cấu hình'}
            </button>
          </div>

          <p className="text-slate-500 leading-relaxed text-[11px]">
            Hệ thống đã tích hợp sẵn giọng đọc nơ-ron từ Microsoft Edge Read Aloud <strong className="text-emerald-600">hoàn toàn miễn phí không cần API Key</strong>. 
            Mục này chỉ dành cho người dùng muốn sử dụng Azure Subscription cá nhân.
          </p>

          {showAzureAdvanced && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    size="sm"
                    label="Azure Subscription Key:"
                    type="password"
                    value={azureKey}
                    onChange={(e) => setAzureKey(e.target.value)}
                    placeholder="Nhập Azure Speech Key (để trống nếu dùng Edge TTS miễn phí)"
                  />
                </div>
                <div>
                  <Input
                    size="sm"
                    label="Region:"
                    type="text"
                    value={azureRegion}
                    onChange={(e) => setAzureRegion(e.target.value)}
                    placeholder="eastus, southeastasia..."
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
                  {azureKey.trim() ? 'Lưu cấu hình Azure' : 'Dùng Edge TTS Miễn Phí'}
                </Button>
              </div>
            </div>
          )}
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

          <Switch
            checked={settings.ttsAutoplay}
            onChange={(checked) => onUpdateSetting('ttsAutoplay', checked)}
            color="blue"
          />
        </Card>

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

          <Switch
            checked={settings.autoStartWithWindows}
            onChange={(checked) => {
              onUpdateSetting('autoStartWithWindows', checked);
              onShowToast(
                checked
                  ? '✅ Đã bật tự khởi động cùng Windows'
                  : 'ℹ️ Đã tắt tự khởi động cùng Windows'
              );
            }}
            color="blue"
          />
        </Card>

        {/* Close button action: Exit vs Minimize to tray */}
        <Card variant="default" rounded="2xl" className="p-4 flex items-center justify-between border border-slate-200">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              Thu nhỏ xuống khay hệ thống khi bấm dấu 'X'
            </div>
            <div className="text-slate-500">
              Mặc định tắt: Bấm dấu 'X' sẽ thoát hoàn toàn phần mềm. Bật lên nếu muốn ứng dụng chạy ngầm dưới khay hệ thống để tiếp tục tra từ nhanh.
            </div>
          </div>

          <Switch
            checked={settings.closeToTray ?? false}
            onChange={(checked) => {
              onUpdateSetting('closeToTray', checked);
              if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
                import('@tauri-apps/api/core')
                  .then(({ invoke }) => invoke('set_close_to_tray', { enabled: checked }))
                  .catch(() => {});
              }
              onShowToast(
                checked
                  ? 'ℹ️ Đã bật: Bấm dấu X sẽ ẩn xuống khay hệ thống'
                  : '✅ Đã tắt: Bấm dấu X sẽ thoát hoàn toàn HyDict'
              );
            }}
            color="blue"
          />
        </Card>
      </div>
    </div>
  );
};
