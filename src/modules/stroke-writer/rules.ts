export function isSingleChineseChar(char: string): boolean {
  if (!char || typeof char !== 'string') return false;
  return char.trim().length === 1 && /[\u4e00-\u9fa5]/.test(char.trim());
}
