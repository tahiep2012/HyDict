export interface AudioPlaybackState {
  isPlaying: boolean;
  activeText: string | null;
  error: string | null;
}

export type TtsEngine = 'google' | 'baidu' | 'azure' | 'system';

export interface AzureSpeechConfig {
  apiKey?: string;
  region?: string;
  voiceName?: string;
}

export interface AudioPlaybackOptions {
  voice?: string;
  rate?: number;
  engine?: TtsEngine;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}
