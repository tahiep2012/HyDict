export function sanitizeAudioText(text: string): string {
  if (!text) return '';
  return text.trim();
}

/**
 * URL phát âm tiếng Trung chuẩn Bắc Kinh chất lượng cao từ Google Translate
 * Hỗ trợ hoàn hảo cho cả từ đơn, từ ghép và câu ví dụ dài.
 */
export function getGoogleTtsAudioUrl(text: string): string {
  const clean = sanitizeAudioText(text);
  if (!clean) return '';
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(clean)}`;
}

/**
 * URL phát âm tiếng Trung dự phòng từ Google APIs GTX (hỗ trợ câu ví dụ dài)
 */
export function getGoogleGtxTtsAudioUrl(text: string): string {
  const clean = sanitizeAudioText(text);
  if (!clean) return '';
  return `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=zh-CN&q=${encodeURIComponent(clean)}`;
}

/**
 * URL phát âm tiếng Trung chuẩn từ Youdao Dict (tối ưu hóa cho từ vựng và cụm từ ngắn Hán ngữ)
 * Độ trễ siêu thấp (<50ms), máy chủ châu Á, giọng Bắc Kinh chuẩn xác.
 */
export function getYoudaoTtsAudioUrl(text: string): string {
  const clean = sanitizeAudioText(text);
  if (!clean) return '';
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&le=zh`;
}

/**
 * URL phát âm tiếng Trung dự phòng từ Baidu Fanyi
 */
export function getBaiduTtsAudioUrl(text: string): string {
  const clean = sanitizeAudioText(text);
  if (!clean) return '';
  return `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(clean)}&spd=5&source=web`;
}

/**
 * Tạo payload SSML cho Microsoft Azure Speech Service (Neural Voice: Xiaoxiao, Yunxi, v.v.)
 */
export function buildAzureSsml(text: string, voice = 'zh-CN-XiaoxiaoNeural'): string {
  const clean = sanitizeAudioText(text);
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="${voice}">${clean}</voice></speak>`;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Kiểm tra xem hệ điều hành đã có giọng đọc tiếng Trung cục bộ hay chưa
 */
export function hasChineseSpeechVoice(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    const voices = window.speechSynthesis.getVoices();
    return voices.some((v) => v.lang.toLowerCase().startsWith('zh'));
  } catch {
    return false;
  }
}
