import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  theme: 'system',
  hotkey: 'Alt+Q',
  autoPronounce: true,
  ankiDeckName: 'Tiếng Trung',
  ankiModelName: 'Basic',
};

export function validateHotkey(hotkey: string): boolean {
  if (!hotkey || typeof hotkey !== 'string') return false;
  const parts = hotkey.split('+');
  return parts.length >= 2;
}
