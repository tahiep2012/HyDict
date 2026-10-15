import { ChineseToken } from './types';

export const CJK_PUNCTUATION_REGEX = /[。，、；：？！“”‘’（）《》—….!?,;:]/;

export function isCjkPunctuation(str: string): boolean {
  return CJK_PUNCTUATION_REGEX.test(str.trim());
}

/**
 * Thuật toán tách từ tiếng Trung thuần túy (Pure Rules)
 * Sử dụng Intl.Segmenter native (ECMAScript CJK standard)
 */
export function segmentChineseText(text: string): ChineseToken[] {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return [];
  }

  // Sử dụng Intl.Segmenter nếu khả dụng (Node 16+ & mọi trình duyệt hiện đại)
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    // @ts-ignore
    const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
    const segments = Array.from(segmenter.segment(text));

    return segments.map((seg: any) => {
      const word = seg.segment;
      const start = seg.index;
      const end = seg.index + word.length;
      const isPunct = word.split('').every((char: string) => isCjkPunctuation(char) || /\s/.test(char));

      return {
        word,
        start,
        end,
        isPunctuation: isPunct,
      };
    });
  }

  // Fallback: Tách từng ký tự nếu không có Intl.Segmenter
  const tokens: ChineseToken[] = [];
  let index = 0;
  for (const char of text) {
    tokens.push({
      word: char,
      start: index,
      end: index + 1,
      isPunctuation: isCjkPunctuation(char),
    });
    index++;
  }
  return tokens;
}

/**
 * Tìm token bao quanh vị trí con trỏ (Cursor offset)
 */
export function findTokenAtOffset(tokens: ChineseToken[], offset: number): ChineseToken | null {
  for (const token of tokens) {
    if (offset >= token.start && offset < token.end && !token.isPunctuation) {
      return token;
    }
  }
  return null;
}
