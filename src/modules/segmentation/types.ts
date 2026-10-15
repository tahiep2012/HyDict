export interface ChineseToken {
  word: string;
  start: number;
  end: number;
  isPunctuation: boolean;
}

export interface SegmentationResult {
  rawSentence: string;
  tokens: ChineseToken[];
  activeWord: string;
}
