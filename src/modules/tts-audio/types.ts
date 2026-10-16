export interface AudioPlaybackState {
  isPlaying: boolean;
  activeText: string | null;
  error: string | null;
}

export type TtsEngine = 'edge' | 'google' | 'youdao' | 'baidu' | 'azure' | 'system';

export interface VoiceDefinition {
  id: string;
  name: string;
  gender: 'male' | 'female';
  desc: string;
  group: 'neural_male' | 'neural_female' | 'fallback';
  recommended?: boolean;
}

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
