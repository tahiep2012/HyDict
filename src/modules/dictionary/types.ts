export interface ExampleSentence {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

export interface DictionaryEntry {
  simplified: string;
  traditional?: string;
  pinyin: string;
  hanViet: string;
  pos?: string;
  definitions: string[];
  examples: ExampleSentence[];
}

export type LookupStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'error';

export type ToneNumber = 1 | 2 | 3 | 4 | 5; // 5 là khinh thanh (neutral tone)

export interface PinyinSyllableToken {
  raw: string;
  clean: string;
  tone: ToneNumber;
  isPunctuation?: boolean;
}

export type HskLevel = 'HSK 1' | 'HSK 2' | 'HSK 3' | 'HSK 4' | 'HSK 5' | 'HSK 6';

export type SearchQueryType = 'chinese' | 'pinyin' | 'vietnamese';

export interface SearchClassificationResult {
  type: SearchQueryType;
  normalizedQuery: string;
  originalQuery: string;
}
