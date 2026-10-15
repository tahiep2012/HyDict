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

      // Chuẩn bị danh sách URL phát âm dự phòng đa tầng (Multi-tier fallback)
      const candidateUrls: string[] = [];

      // Tầng 1: Google Translate TTS Native (Chất lượng cao, hỗ trợ cả câu dài và từ đơn)
      const googleUrl = getGoogleTtsAudioUrl(cleanText);
      if (googleUrl) candidateUrls.push(googleUrl);

      // Tầng 2: Nếu là từ đơn hoặc cụm từ ngắn (<= 12 ký tự): Youdao Dict TTS là lựa chọn hoàn hảo
      if (cleanText.length <= 12) {
        const youdaoUrl = getYoudaoTtsAudioUrl(cleanText);
        if (youdaoUrl) candidateUrls.push(youdaoUrl);
      }

      // Tầng 3: Google APIs GTX (Dự phòng cho câu dài)
      const gtxUrl = getGoogleGtxTtsAudioUrl(cleanText);
      if (gtxUrl) candidateUrls.push(gtxUrl);

      // Tầng 4: Baidu Fanyi TTS (Dự phòng tiếp theo)
      const baiduUrl = getBaiduTtsAudioUrl(cleanText);
      if (baiduUrl) candidateUrls.push(baiduUrl);

      // 2. Kiểm tra nếu có Azure Speech Key được lưu trong localStorage
      try {
        const rawAzure = localStorage.getItem('hanzii_azure_speech');
        if (rawAzure) {
          const azureConfig: AzureSpeechConfig = JSON.parse(rawAzure);
          if (azureConfig.apiKey && azureConfig.region) {
            try {
              const voice = options?.voice || azureConfig.voiceName || 'zh-CN-XiaoxiaoNeural';
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
              // Nếu Azure lỗi kết nối, tự động chuyển tiếp sang luồng dự phòng
            }
          }
        }
      } catch {
        // bỏ qua lỗi đọc localStorage
      }

      // 3. Tầng Chính & Dự phòng trực tuyến không cần API Key
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
