import { useState, useEffect } from 'react';
import { DictionaryEntry, LookupStatus } from '../types';
import { queryLocalDictionary } from '../rules';

export function useDictionaryLookup(initialWord: string = '') {
  const [word, setWord] = useState(initialWord);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [status, setStatus] = useState<LookupStatus>('idle');

  useEffect(() => {
    if (initialWord && initialWord !== word) {
      setWord(initialWord);
    }
  }, [initialWord]);

  useEffect(() => {
    if (!word || word.trim() === '') {
      setEntry(null);
      setStatus('idle');
      return;
    }

    setStatus('loading');

    // Thử gọi Tauri command nếu đang chạy trong môi trường Desktop
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => {
          return invoke<DictionaryEntry | null>('lookup_dictionary', { word });
        })
        .then((result) => {
          if (result) {
            setEntry(result);
            setStatus('success');
          } else {
            // Thử fallback local
            const fallback = queryLocalDictionary(word);
            if (fallback) {
              setEntry(fallback);
              setStatus('success');
            } else {
              setEntry(null);
              setStatus('not_found');
            }
          }
        })
        .catch(() => {
          const fallback = queryLocalDictionary(word);
          if (fallback) {
            setEntry(fallback);
            setStatus('success');
          } else {
            setStatus('not_found');
          }
        });
    } else {
      // Môi trường Web / Mock / Test
      const result = queryLocalDictionary(word);
      if (result) {
        setEntry(result);
        setStatus('success');
      } else {
        setEntry(null);
        setStatus('not_found');
      }
    }
  }, [word]);

  return {
    word,
    setWord,
    entry,
    status,
    lookup: (w: string) => setWord(w),
  };
}
