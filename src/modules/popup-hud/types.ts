export interface HudPosition {
  x: number;
  y: number;
}

export interface CharacterRadicalInfo {
  radical: string;
  name: string;
  meaning: string;
  strokeCount: number;
}

export interface CompoundWord {
  word: string;
  pinyin: string;
  meaning: string;
}

export interface HudWindowProps {
  isOpen: boolean;
  isPinned: boolean;
  position?: HudPosition;
  onClose: () => void;
  onTogglePin: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

