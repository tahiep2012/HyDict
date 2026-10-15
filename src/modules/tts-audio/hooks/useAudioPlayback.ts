import { useState, useCallback, useRef, useEffect } from 'react';
import {
  sanitizeAudioText,
  getGoogleTtsAudioUrl,
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
                  fallbackToGoogle(audioRef, cleanText, handleEnded, handleFinalError);
                };
                await audio.play();
                return;
              }
            } catch {
              // Nếu Azure lỗi kết nối, tự động chuyển tiếp sang Google TTS
            }
          }
        }
      } catch {
        // bỏ qua lỗi đọc localStorage
      }

      // 3. Tầng Chính (Default): Google Translate Native TTS (Không cần API Key, siêu nét)
      fallbackToGoogle(audioRef, cleanText, handleEnded, handleFinalError);
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

function fallbackToGoogle(
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  cleanText: string,
  onEnd: () => void,
  onError: (err?: any) => void
) {
  try {
    const googleUrl = getGoogleTtsAudioUrl(cleanText);
    const audio = new Audio(googleUrl);
    audioRef.current = audio;

    audio.onended = () => {
      onEnd();
    };

    audio.onerror = () => {
      // 4. Tầng Dự phòng 2: Baidu Fanyi TTS
      fallbackToBaidu(audioRef, cleanText, onEnd, onError);
    };

    audio.play().catch(() => {
      fallbackToBaidu(audioRef, cleanText, onEnd, onError);
    });
  } catch {
    fallbackToBaidu(audioRef, cleanText, onEnd, onError);
  }
}

function fallbackToBaidu(
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  cleanText: string,
  onEnd: () => void,
  onError: (err?: any) => void
) {
  try {
    const baiduUrl = getBaiduTtsAudioUrl(cleanText);
    const audio = new Audio(baiduUrl);
    audioRef.current = audio;

    audio.onended = () => {
      onEnd();
    };

    audio.onerror = () => {
      // 5. Tầng Dự phòng 3: Web Speech API (nếu máy có cài gói giọng Windows)
      fallbackToSpeechSynthesis(cleanText, onEnd, onError);
    };

    audio.play().catch(() => {
      fallbackToSpeechSynthesis(cleanText, onEnd, onError);
    });
  } catch {
    fallbackToSpeechSynthesis(cleanText, onEnd, onError);
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
