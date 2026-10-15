import { ToneNumber, PinyinSyllableToken } from '../types';

const TONE_1_CHARS = new Set(['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ', 'Ā', 'Ē', 'Ī', 'Ō', 'Ū', 'Ǖ']);
const TONE_2_CHARS = new Set(['á', 'é', 'í', 'ó', 'ú', 'ǘ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ǘ']);
const TONE_3_CHARS = new Set(['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ', 'Ǎ', 'Ě', 'Ǐ', 'Ǒ', 'Ǔ', 'Ǚ']);
const TONE_4_CHARS = new Set(['à', 'è', 'ì', 'ò', 'ù', 'ǜ', 'À', 'È', 'Ì', 'Ò', 'Ù', 'Ǜ']);

/**
 * Xác định thanh điệu (1, 2, 3, 4 hoặc 5 - khinh thanh) của một âm tiết Pinyin
 */
export function getToneFromPinyinSyllable(syllable: string): ToneNumber {
  if (!syllable) return 5;

  // 1. Kiểm tra chữ số thanh điệu ở cuối (vd: ni3, hao3)
  const lastChar = syllable.slice(-1);
  if (['1', '2', '3', '4', '5'].includes(lastChar)) {
    return parseInt(lastChar, 10) as ToneNumber;
  }

  // 2. Kiểm tra các nguyên âm có dấu thanh
  for (const ch of syllable) {
    if (TONE_1_CHARS.has(ch)) return 1;
    if (TONE_2_CHARS.has(ch)) return 2;
    if (TONE_3_CHARS.has(ch)) return 3;
    if (TONE_4_CHARS.has(ch)) return 4;
  }

  return 5; // Khinh thanh (neutral tone)
}

/**
 * Trả về mã màu Tailwind CSS theo chuẩn quốc tế Pleco
 */
export function getToneColorClass(tone: ToneNumber): string {
  switch (tone) {
    case 1:
      return 'text-rose-600 dark:text-rose-400 font-medium'; // Thanh 1: Đỏ
    case 2:
      return 'text-amber-500 dark:text-amber-400 font-medium'; // Thanh 2: Cam / Vàng
    case 3:
      return 'text-emerald-600 dark:text-emerald-400 font-medium'; // Thanh 3: Xanh lá
    case 4:
      return 'text-blue-600 dark:text-blue-400 font-medium'; // Thanh 4: Xanh dương
    case 5:
    default:
      return 'text-slate-400 dark:text-slate-500'; // Khinh thanh: Xám
  }
}

/**
 * Phân tích chuỗi Pinyin đầy đủ thành danh sách các token âm tiết để tô màu
 * Ví dụ: "[ bào xiāo ]" -> tokens: ["[", "bào" (thanh 4), "xiāo" (thanh 1), "]"]
 */
export function parsePinyinToTokens(pinyinStr: string): PinyinSyllableToken[] {
  if (!pinyinStr) return [];

  // Tách chuỗi theo khoảng trắng và các ký tự phân cách
  const parts = pinyinStr.trim().split(/\s+/);
  const tokens: PinyinSyllableToken[] = [];

  for (const part of parts) {
    if (!part) continue;

    // Tách các dấu ngoặc vuông nếu dính liền (vd: "[wǒ" hoặc "xiāo]")
    let cleanPart = part;
    if (cleanPart.startsWith('[')) {
      tokens.push({ raw: '[', clean: '[', tone: 5, isPunctuation: true });
      cleanPart = cleanPart.slice(1);
    }

    let endsWithBracket = false;
    if (cleanPart.endsWith(']')) {
      endsWithBracket = true;
      cleanPart = cleanPart.slice(0, -1);
    }

    if (cleanPart) {
      if (cleanPart === '[' || cleanPart === ']' || cleanPart === '/' || cleanPart === ',') {
        tokens.push({ raw: cleanPart, clean: cleanPart, tone: 5, isPunctuation: true });
      } else {
        const tone = getToneFromPinyinSyllable(cleanPart);
        tokens.push({
          raw: cleanPart,
          clean: cleanPart.replace(/[1-5]$/, ''),
          tone,
          isPunctuation: false,
        });
      }
    }

    if (endsWithBracket) {
      tokens.push({ raw: ']', clean: ']', tone: 5, isPunctuation: true });
    }
  }

  return tokens;
}
