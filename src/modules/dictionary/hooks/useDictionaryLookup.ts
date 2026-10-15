import { useState, useEffect } from 'react';
import { DictionaryEntry, LookupStatus, SearchClassificationResult } from '../types';
import { queryLocalDictionary, queryLocalDictionaryMulti } from '../rules';
import { classifySearchQuery } from '../rules/queryClassifier';

export interface UseDictionaryLookupReturn {
  word: string;
  setWord: (w: string) => void;
  entry: DictionaryEntry | null;
  multiResults: DictionaryEntry[];
  classification: SearchClassificationResult;
  status: LookupStatus;
  lookup: (w: string) => void;
  selectEntry: (entry: DictionaryEntry) => void;
}

export function useDictionaryLookup(initialWord: string = ''): UseDictionaryLookupReturn {
  const [word, setWord] = useState(initialWord);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [multiResults, setMultiResults] = useState<DictionaryEntry[]>([]);
  const [classification, setClassification] = useState<SearchClassificationResult>(() =>
    classifySearchQuery(initialWord)
  );
  const [status, setStatus] = useState<LookupStatus>('idle');

  useEffect(() => {
    if (initialWord && initialWord !== word) {
      setWord(initialWord);
    }
  }, [initialWord]);

  useEffect(() => {
    if (!word || word.trim() === '') {
      setEntry(null);
      setMultiResults([]);
      setStatus('idle');
      return;
    }

    const currentClass = classifySearchQuery(word);
    setClassification(currentClass);
    setStatus('loading');

    // Môi trường Desktop Tauri
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => {
          return invoke<DictionaryEntry[]>('search_dictionary_multi', {
            query: word,
            queryType: currentClass.type,
          });
        })
        .then((results) => {
          if (results && results.length > 0) {
            setMultiResults(results);
            setEntry(results[0]);
            setStatus('success');
          } else {
            // Thử fallback trực tiếp lookup_dictionary
            return import('@tauri-apps/api/core').then(({ invoke }) =>
              invoke<DictionaryEntry | null>('lookup_dictionary', { word })
            );
          }
        })
        .then((singleFallback) => {
          if (singleFallback) {
            setMultiResults([singleFallback]);
            setEntry(singleFallback);
            setStatus('success');
          } else if (status !== 'success') {
            // Fallback in-memory/mock
            const fallbackResults = queryLocalDictionaryMulti(word, currentClass.type);
            if (fallbackResults.length > 0) {
              setMultiResults(fallbackResults);
              setEntry(fallbackResults[0]);
              setStatus('success');
            } else {
              setEntry(null);
              setMultiResults([]);
              setStatus('not_found');
            }
          }
        })
        .catch(() => {
          const fallbackResults = queryLocalDictionaryMulti(word, currentClass.type);
          if (fallbackResults.length > 0) {
            setMultiResults(fallbackResults);
            setEntry(fallbackResults[0]);
            setStatus('success');
          } else {
            setEntry(null);
            setMultiResults([]);
            setStatus('not_found');
          }
        });
    } else {
      // Môi trường Web / Test / Mock
      const fallbackResults = queryLocalDictionaryMulti(word, currentClass.type);
      if (fallbackResults.length > 0) {
        setMultiResults(fallbackResults);
        setEntry(fallbackResults[0]);
        setStatus('success');
      } else {
        const single = queryLocalDictionary(word);
        if (single) {
          setMultiResults([single]);
          setEntry(single);
          setStatus('success');
        } else {
          setEntry(null);
          setMultiResults([]);
          setStatus('not_found');
        }
      }
    }
  }, [word]);

  const selectEntry = (selected: DictionaryEntry) => {
    setEntry(selected);
  };

  return {
    word,
    setWord,
    entry,
    multiResults,
    classification,
    status,
    lookup: (w: string) => setWord(w),
    selectEntry,
  };
}
