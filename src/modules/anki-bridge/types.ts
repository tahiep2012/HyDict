export interface AnkiNoteFields {
  Hanzi: string;
  Pinyin: string;
  HanViet: string;
  Meaning: string;
  Example?: string;
  Audio?: string;
}

export interface AnkiCardPayload {
  deckName: string;
  modelName: string;
  fields: AnkiNoteFields;
  tags: string[];
}

export type AnkiSyncStatus = 'idle' | 'checking' | 'adding' | 'success' | 'error';
