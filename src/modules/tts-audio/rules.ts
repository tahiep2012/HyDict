import { VoiceDefinition } from './types';

export function sanitizeAudioText(text: string): string {
  if (!text) return '';
  return text.trim();
}

export const SUPPORTED_TTS_VOICES: VoiceDefinition[] = [
  // Giọng Nam Neural Microsoft
  {
    id: 'zh-CN-YunxiNeural',
    name: 'Yunxi (云希) - Nam thanh niên',
    gender: 'male',
    desc: 'Ấm áp, tự nhiên, sinh động, chuẩn Bắc Kinh',
    group: 'neural_male',
    recommended: true,
  },
  {
    id: 'zh-CN-YunjianNeural',
    name: 'Yunjian (云健) - Nam trưởng thành',
    gender: 'male',
    desc: 'Dõng dạc, truyền cảm, chuẩn phát thanh viên',
    group: 'neural_male',
  },
  {
    id: 'zh-CN-YunyangNeural',
    name: 'Yunyang (云扬) - Nam thời sự',
    gender: 'male',
    desc: 'Chuyên nghiệp, rõ ràng, phong cách tin tức',
    group: 'neural_male',
  },

  // Giọng Nữ Neural Microsoft
  {
    id: 'zh-CN-XiaoxiaoNeural',
    name: 'Xiaoxiao (晓晓) - Nữ tiêu chuẩn',
    gender: 'female',
    desc: 'Tự nhiên, dịu dàng, phổ thông chuẩn quốc gia',
    group: 'neural_female',
    recommended: true,
  },
  {
    id: 'zh-CN-XiaoyiNeural',
    name: 'Xiaoyi (晓伊) - Nữ trẻ trung',
    gender: 'female',
    desc: 'Trong trẻo, biểu cảm phong phú, sống động',
    group: 'neural_female',
  },
  {
    id: 'zh-CN-liaoning-XiaobeiNeural',
    name: 'Xiaobei (晓北) - Nữ Đông Bắc',
    gender: 'female',
    desc: 'Giọng địa phương Đông Bắc, tự nhiên, thân thiện',
    group: 'neural_female',
  },
  {
    id: 'zh-HK-HiuMaanNeural',
    name: 'HiuMaan (晓曼) - Nữ Quảng Đông',
    gender: 'female',
    desc: 'Tiếng Quảng Đông chuẩn (Cantonese, Hồng Kông)',
    group: 'neural_female',
  },

  // Dự phòng trực tuyến miễn phí
  {
    id: 'google-female',
    name: 'Google Translate Native TTS',
    gender: 'female',
    desc: 'Giọng Nữ phổ thông chuẩn (Máy chủ Google Web)',
    group: 'fallback',
  },
  {
    id: 'youdao-female',
    name: 'Youdao Dict TTS',
    gender: 'female',
    desc: 'Giọng Nữ từ vựng Hán ngữ chuẩn Youdao',
    group: 'fallback',
  },
];

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
export function buildAzureSsml(text: string, voice = 'zh-CN-XiaoxiaoNeural', rate = '0%'): string {
  const clean = sanitizeAudioText(text);
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="${voice}"><prosody rate="${rate}">${clean}</prosody></voice></speak>`;
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
