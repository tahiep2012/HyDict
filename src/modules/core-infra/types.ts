export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  hotkey: string;
  autoPronounce: boolean;
  ankiDeckName: string;
  ankiModelName: string;
}

export type UIState = 'loading' | 'empty' | 'error' | 'success';
