import { useState, useCallback, useRef, useEffect } from 'react';
import {
  sanitizeAudioText,
  getGoogleTtsAudioUrl,
  getGoogleGtxTtsAudioUrl,
  getYoudaoTtsAudioUrl,
  getBaiduTtsAudioUrl,
  buildAzureSsml,
  isSpeechSynthesisSupported,
} from '../rules';
import { AudioPlaybackOptions, AzureSpeechConfig } from '../types';

function base64ToBlobUrl(base64: string, mimeType = 'audio/mpeg'): string {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dừng phát âm thanh khi component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (isSpeechSynthesisSupported()) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setCurrentText(null);
  }, []);

  const playAudio = useCallback(
    async (text: string, options?: AudioPlaybackOptions) => {
      const cleanText = sanitizeAudioText(text);
      if (!cleanText) return;

      // 1. Dừng bất kỳ âm thanh nào đang phát trước đó
      stopAudio();

      setIsPlaying(true);
      setCurrentText(cleanText);
      options?.onStart?.();

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentText(null);
        options?.onEnd?.();
      };

      const handleFinalError = (err?: any) => {
        setIsPlaying(false);
        setCurrentText(null);
        options?.onError?.(err);
      };

      // Xác định giọng đọc và tốc độ (từ options hoặc từ cài đặt đã lưu trong localStorage)
      let selectedVoice = options?.voice;
      let selectedRate = options?.rate;
      try {
        const savedSettings = localStorage.getItem('hanzii_app_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (!selectedVoice && parsed.ttsVoice) {
            selectedVoice = parsed.ttsVoice;
          }
          if (selectedRate === undefined && parsed.ttsSpeed) {
            selectedRate = parsed.ttsSpeed;
          }
        }
      } catch {
        // ignore
      }

      // Mặc định giọng nam Yunxi nếu chưa cấu hình
      const voice = selectedVoice || 'zh-CN-YunxiNeural';
      const rate = selectedRate || 1.0;

      // Chuẩn bị danh sách URL phát âm dự phòng đa tầng (Multi-tier fallback)
      const candidateUrls: string[] = [];

      if (voice === 'youdao-female') {
        const youdaoUrl = getYoudaoTtsAudioUrl(cleanText);
        if (youdaoUrl) candidateUrls.push(youdaoUrl);
        const googleUrl = getGoogleTtsAudioUrl(cleanText);
        if (googleUrl) candidateUrls.push(googleUrl);
      } else {
        // Mặc định: Google Translate TTS Native
        const googleUrl = getGoogleTtsAudioUrl(cleanText);
        if (googleUrl) candidateUrls.push(googleUrl);

        if (cleanText.length <= 12) {
          const youdaoUrl = getYoudaoTtsAudioUrl(cleanText);
          if (youdaoUrl) candidateUrls.push(youdaoUrl);
        }

        const gtxUrl = getGoogleGtxTtsAudioUrl(cleanText);
        if (gtxUrl) candidateUrls.push(gtxUrl);

        const baiduUrl = getBaiduTtsAudioUrl(cleanText);
        if (baiduUrl) candidateUrls.push(baiduUrl);
      }

      // Nếu người dùng chọn trực tiếp nguồn fallback (không phải neural)
      if (voice === 'google-female' || voice === 'youdao-female') {
        playCandidateStreams(audioRef, candidateUrls, 0, cleanText, handleEnded, handleFinalError);
        return;
      }

      // TẦNG 1: Microsoft Azure Speech (Nếu người dùng nhập Azure API Key trả phí/free cá nhân)
      try {
        const rawAzure = localStorage.getItem('hanzii_azure_speech');
        if (rawAzure) {
          const azureConfig: AzureSpeechConfig = JSON.parse(rawAzure);
          if (azureConfig.apiKey && azureConfig.region) {
            try {
              const ssml = buildAzureSsml(cleanText, voice);
              const res = await fetch(
                `https://${azureConfig.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                {
                  method: 'POST',
                  headers: {
                    'Ocp-Apim-Subscription-Key': azureConfig.apiKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                    'User-Agent': 'HanziiDictDesktop',
                  },
                  body: ssml,
                }
              );

              if (res.ok) {
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const audio = new Audio(blobUrl);
                audioRef.current = audio;

                audio.onended = () => {
                  URL.revokeObjectURL(blobUrl);
                  handleEnded();
                };
                audio.onerror = () => {
                  URL.revokeObjectURL(blobUrl);
                  playCandidateStreams(audioRef, candidateUrls, 0, cleanText, handleEnded, handleFinalError);
                };
                await audio.play();
                return;
              }
            } catch {
              // Bỏ qua lỗi Azure, chuyển tiếp xuống Edge Read Aloud
            }
          }
        }
      } catch {
        // bỏ qua lỗi đọc localStorage
      }

      // TẦNG 2: Microsoft Edge Read Aloud Neural Voice (MIỄN PHÍ KHÔNG CẦN KEY - Tự động qua Rust Backend)
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const res = await invoke<{ audio_base64: string; voice: string }>('synthesize_speech', {
          text: cleanText,
          voice,
          rate,
        });

        if (res && res.audio_base64) {
          const blobUrl = base64ToBlobUrl(res.audio_base64);
          const audio = new Audio(blobUrl);
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(blobUrl);
            handleEnded();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            playCandidateStreams(audioRef, candidateUrls, 0, cleanText, handleEnded, handleFinalError);
          };
          await audio.play();
          return;
        }
      } catch (edgeErr) {
        // Nếu chạy ở môi trường web/test không có Tauri hoặc mạng lỗi, tự động hạ cấp xuống Tầng 3
        console.warn('Edge TTS unavailable or failed, falling back to web streams:', edgeErr);
      }

      // TẦNG 3: Nguồn trực tuyến miễn phí (Google Translate TTS Native / Youdao / Baidu)
      playCandidateStreams(audioRef, candidateUrls, 0, cleanText, handleEnded, handleFinalError);
    },
    [stopAudio]
  );

  return {
    isPlaying,
    currentText,
    playAudio,
    stopAudio,
  };
}

/**
 * Phát âm thanh tuần tự qua các nguồn máy chủ trực tuyến với cơ chế chặn gửi Referer (no-referrer)
 */
function playCandidateStreams(
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  urls: string[],
  index: number,
  cleanText: string,
  onEnd: () => void,
  onError: (err?: any) => void
) {
  if (index >= urls.length) {
    // Nếu tất cả các URL trực tuyến đều lỗi -> Thử Web Speech API cục bộ
    fallbackToSpeechSynthesis(cleanText, onEnd, onError);
    return;
  }

  const currentUrl = urls[index];
  try {
    const audio = new Audio();
    // BẮT BUỘC: Thiết lập no-referrer để không bị Google/Baidu chặn lỗi 404 do hotlinking
    (audio as any).referrerPolicy = 'no-referrer';
    audio.setAttribute('referrerpolicy', 'no-referrer');
    audio.src = currentUrl;
    audioRef.current = audio;

    let hasAdvanced = false;
    const advanceNext = () => {
      if (!hasAdvanced) {
        hasAdvanced = true;
        // Chỉ chuyển tiếp nếu audioRef vẫn đang là bản ghi này (chưa bị dừng hoặc chuyển từ khác)
        if (audioRef.current === audio) {
          playCandidateStreams(audioRef, urls, index + 1, cleanText, onEnd, onError);
        }
      }
    };

    audio.onended = () => {
      if (audioRef.current === audio) {
        onEnd();
      }
    };

    audio.onerror = () => {
      advanceNext();
    };

    audio.play().catch(() => {
      advanceNext();
    });
  } catch {
    playCandidateStreams(audioRef, urls, index + 1, cleanText, onEnd, onError);
  }
}

function fallbackToSpeechSynthesis(
  cleanText: string,
  onEnd: () => void,
  onError: (err?: any) => void
) {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;

      utterance.onend = () => {
        onEnd();
      };

      utterance.onerror = (e) => {
        onError(e);
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      onError(e);
      return;
    }
  }
  onError();
}
