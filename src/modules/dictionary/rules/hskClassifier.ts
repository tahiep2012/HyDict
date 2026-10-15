import { HskLevel } from '../types';
import hskData from './hskData.json';

const HSK_DICT: Record<string, number> = hskData as Record<string, number>;

/**
 * Phân loại cấp độ HSK (1 đến 6) cho từ vựng tiếng Trung
 * Trả về "HSK 1", "HSK 2", ... "HSK 6" hoặc null nếu không thuộc danh mục HSK
 */
export function getHskLevel(word: string): HskLevel | null {
  if (!word) return null;
  const cleanWord = word.trim();
  const levelNum = HSK_DICT[cleanWord];
  if (levelNum && levelNum >= 1 && levelNum <= 6) {
    return `HSK ${levelNum}` as HskLevel;
  }
  return null;
}
