import { AnkiCardPayload, AnkiNoteFields } from './types';

export const ANKICONNECT_URL = 'http://127.0.0.1:8765';

export function createAnkiPayload(
  fields: AnkiNoteFields,
  deckName: string = 'Tiếng Trung',
  modelName: string = 'Basic'
): AnkiCardPayload {
  return {
    deckName,
    modelName,
    fields,
    tags: ['hydict', 'desktop_lookup'],
  };
}

export function buildAnkiConnectRequestBody(action: string, params: Record<string, any> = {}) {
  return {
    action,
    version: 6,
    params,
  };
}
