import { useState, useMemo } from 'react';
import { segmentChineseText, findTokenAtOffset } from '../rules';
import { ChineseToken } from '../types';

export function useSegmentation(initialSentence: string = '') {
  const [sentence, setSentence] = useState(initialSentence);
  const [activeWord, setActiveWord] = useState('');

  const tokens = useMemo<ChineseToken[]>(() => {
    return segmentChineseText(sentence);
  }, [sentence]);

  const selectWordAtOffset = (offset: number) => {
    const token = findTokenAtOffset(tokens, offset);
    if (token) {
      setActiveWord(token.word);
    }
  };

  return {
    sentence,
    setSentence,
    tokens,
    activeWord,
    setActiveWord,
    selectWordAtOffset,
  };
}
