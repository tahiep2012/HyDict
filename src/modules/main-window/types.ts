export type MainWindowTab = 'dict' | 'hotkey' | 'anki' | 'settings';

export type CaptureMode = 'bubble' | 'instant' | 'alt_hold';

export interface AppSettings {
  globalHotkey: string;
  enableCursorCapture: boolean;
  captureMode: CaptureMode;
  filterCjkOnly: boolean;
  ankiDeck: string;
  ankiModel: string;
  ankiConnected: boolean;
  ttsVoice: string;
  ttsAutoplay: boolean;
  autoStartWithWindows: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  globalHotkey: 'Alt+Q',
  enableCursorCapture: true,
  captureMode: 'bubble',
  filterCjkOnly: true,
  ankiDeck: 'Tiếng Trung (HSK 1 - 6)',
  ankiModel: 'HyDict-Rich-Card',
  ankiConnected: true,
  ttsVoice: 'zh-CN-XiaoxiaoNeural',
  ttsAutoplay: true,
  autoStartWithWindows: true,
};
