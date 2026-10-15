import React, { useState, useEffect, useRef } from 'react';
import {
  MainWindowLayout,
  useMainWindowState,
} from '@/modules/main-window';
import { useSegmentation } from '@/modules/segmentation';
import { useDictionaryLookup } from '@/modules/dictionary';
import {
  HudWindowContainer,
  HudLingoesContent,
} from '@/modules/popup-hud';
import { useAudioPlayback } from '@/modules/tts-audio';
import { useNotebook } from '@/modules/notebook';
import { ScreenSnipper } from '@/modules/screen-snipper';

// ============================================================================
// 1. STANDALONE HUD WINDOW (Cửa sổ Quick Lookup mini độc lập chuẩn Lingoes)
// ============================================================================
const StandaloneHudApp: React.FC = () => {
  const [targetText, setTargetText] = useState('住');
  const [searchInput, setSearchInput] = useState('住');
  const [isPinned, setIsPinned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lịch sử duyệt từ (Lingoes History < >)
  const [history, setHistory] = useState<string[]>(['住']);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const {
    sentence,
    setSentence,
    tokens,
    activeWord,
    setActiveWord,
  } = useSegmentation(targetText);

  const { entry, status, lookup } = useDictionaryLookup(activeWord || targetText);
  const { playAudio } = useAudioPlayback();
  const { isFavorite, toggleFavorite, addHistory: addSearchHistory } = useNotebook();

  // Tự động ghi lại lịch sử tra cứu mỗi khi tải được từ vựng hợp lệ
  useEffect(() => {
    if (entry && entry.simplified) {
      addSearchHistory({
        word: entry.simplified,
        pinyin: entry.pinyin,
        hanViet: entry.hanViet,
      });
    }
  }, [entry?.simplified, entry?.pinyin, entry?.hanViet, addSearchHistory]);

  const currentWord = entry?.simplified || activeWord || targetText;
  const isBookmarked = isFavorite(currentWord);

  const handleToggleBookmark = () => {
    if (!currentWord) return;
    const willBeSaved = !isBookmarked;
    toggleFavorite({
      word: currentWord,
      pinyin: entry?.pinyin || '',
      hanViet: entry?.hanViet || '',
      definition: entry?.definitions?.join('; ') || '',
    });
    showToast(
      willBeSaved
        ? `⭐ Đã thêm [${currentWord}] vào Sổ tay từ yêu thích!`
        : `🗑️ Đã xóa [${currentWord}] khỏi Sổ tay từ yêu thích`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const navigateToWord = (word: string, pushHistory = true) => {
    const clean = word.trim();
    if (!clean) return;
    setSearchInput(clean);
    setTargetText(clean);
    setSentence(clean);
    setActiveWord(clean);
    lookup(clean);
    playAudio(clean);

    if (pushHistory) {
      setHistory((prev) => {
        const next = [...prev.slice(0, historyIdx + 1), clean];
        setHistoryIdx(next.length - 1);
        return next;
      });
    }
  };

  const lastTriggeredRef = useRef(Date.now());
  const isPinnedRef = useRef(isPinned);

  useEffect(() => {
    isPinnedRef.current = isPinned;
  }, [isPinned]);

  const handleClose = () => {
    setIsPinned(false);
    isPinnedRef.current = false;
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => {
          invoke('set_hud_pinned', { pinned: false });
          invoke('hide_hud_window');
        })
        .catch(() => {});
    }
  };

  const handleTogglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    isPinnedRef.current = nextPinned;
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('set_hud_pinned', { pinned: nextPinned }))
        .catch(() => {});
      import('@tauri-apps/api/webviewWindow')
        .then(({ getCurrentWebviewWindow }) => {
          return getCurrentWebviewWindow().setAlwaysOnTop(nextPinned);
        })
        .catch(() => {});
    }
    showToast(nextPinned ? '📌 Đã ghim cửa sổ HUD' : '🔓 Đã bỏ ghim HUD');
  };

  const handleHistoryBack = () => {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      const target = history[nextIdx];
      navigateToWord(target, false);
    }
  };

  const handleHistoryForward = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      const target = history[nextIdx];
      navigateToWord(target, false);
    }
  };

  const handleCopyDefinition = () => {
    if (!entry) return;
    const lines = [
      `${entry.simplified} ${entry.pinyin}`,
      entry.hanViet,
      '',
      'Định nghĩa:',
      ...entry.definitions.map((d, i) => `${i + 1}. ${d}`),
    ];
    if (entry.examples && entry.examples.length > 0) {
      lines.push('', 'Ví dụ:');
      entry.examples.forEach((e) => {
        lines.push(`${e.chinese} (${e.pinyin}) - ${e.vietnamese}`);
      });
    }
    const fullText = lines.join('\n');
    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        showToast('📋 Đã sao chép toàn bộ giải nghĩa');
      })
      .catch(() => {
        showToast('⚠️ Không thể sao chép');
      });
  };

  const handleOpenInMainWindow = () => {
    const word = entry?.simplified || activeWord || targetText;
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('open_main_window', { word }))
        .catch(() => {});
    }
    showToast('🚀 Đang mở trên cửa sổ chính...');
  };

  // Lắng nghe sự kiện phím tắt toàn cục OS từ backend Tauri (Alt+Q, Ctrl+Q, Shift+T)
  useEffect(() => {
    let unlistenFn: (() => void) | null = null;

    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/event')
        .then(({ listen }) => {
          return listen<string>('quick-lookup-triggered', (event) => {
            lastTriggeredRef.current = Date.now();
            const rawText = event.payload;
            const text = rawText ? rawText.trim() : '';
            if (text) {
              navigateToWord(text, true);
            }
          });
        })
        .then((unlisten) => {
          unlistenFn = unlisten;
        })
        .catch(() => {});
    }

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, [historyIdx, history]);

  // Tự động đóng HUD khi click chuột ra ngoài (mất focus / blur) nếu không ghim
  useEffect(() => {
    let unlistenFocus: (() => void) | null = null;

    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/webviewWindow')
        .then(({ getCurrentWebviewWindow }) => {
          return getCurrentWebviewWindow().onFocusChanged(({ payload: focused }) => {
            if (!focused && !isPinnedRef.current && Date.now() - lastTriggeredRef.current > 350) {
              handleClose();
            }
          });
        })
        .then((unlisten) => {
          unlistenFocus = unlisten;
        })
        .catch(() => {});
    }

    const handleBlur = () => {
      if (!isPinnedRef.current && Date.now() - lastTriggeredRef.current > 350) {
        handleClose();
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      if (unlistenFocus) unlistenFocus();
    };
  }, []);

  // Phím tắt Esc để đóng cửa sổ khi không ghim
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPinnedRef.current) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen bg-white p-0 flex flex-col justify-start items-center select-none overflow-hidden">
      <HudWindowContainer
        isOpen={true}
        isPinned={isPinned}
        onClose={handleClose}
        onTogglePin={handleTogglePin}
        title="HyDict Quick Lookup"
        className="w-full h-full shadow-2xl bg-white border-none rounded-none"
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(val) => navigateToWord(val, true)}
        onPlayAudio={() => playAudio(entry?.simplified || activeWord || targetText)}
        onHistoryBack={handleHistoryBack}
        onHistoryForward={handleHistoryForward}
        canHistoryBack={historyIdx > 0}
        canHistoryForward={historyIdx < history.length - 1}
        onCopyDefinition={handleCopyDefinition}
        onOpenMainWindow={handleOpenInMainWindow}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleToggleBookmark}
      >
        <HudLingoesContent
          entry={entry}
          status={status}
          targetText={targetText}
          activeWord={activeWord || targetText}
          tokens={tokens}
          onSelectWord={(w) => navigateToWord(w, true)}
          onPlayAudio={playAudio}
        />
      </HudWindowContainer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-3 right-3 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 z-50 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. MAIN WINDOW APPLICATION (Trung tâm cài đặt, quản lý & tra từ điển chính)
// ============================================================================
const MainWindowApp: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    updateSetting,
    searchQuery,
    setSearchQuery,
    recentSearches,
    addToRecent,
    isTrayModalOpen,
    setIsTrayModalOpen,
  } = useMainWindowState();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { entry, lookup } = useDictionaryLookup(searchQuery || '万');
  const { playAudio } = useAudioPlayback();
  const { addHistory: addSearchHistory } = useNotebook();

  useEffect(() => {
    if (entry && entry.simplified) {
      addSearchHistory({
        word: entry.simplified,
        pinyin: entry.pinyin,
        hanViet: entry.hanViet,
      });
    }
  }, [entry?.simplified, entry?.pinyin, entry?.hanViet, addSearchHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectMainWord = (word: string) => {
    setSearchQuery(word);
    addToRecent(word);
    lookup(word);
  };

  // Lắng nghe sự kiện mở từ cửa sổ HUD sang MainWindow ("open-main-word")
  useEffect(() => {
    let unlistenFn: (() => void) | null = null;
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/event')
        .then(({ listen }) => {
          return listen<string>('open-main-word', (event) => {
            if (event.payload) {
              handleSelectMainWord(event.payload);
            }
          });
        })
        .then((unlisten) => {
          unlistenFn = unlisten;
        })
        .catch(() => {});
    }
    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, []);

  const handleOpenQuickHud = () => {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('open_hud_window', { word: searchQuery || '万' }))
        .catch(() => {});
    } else {
      showToast('⚡ Chế độ Desktop: Cửa sổ HUD mở độc lập qua phím tắt Ctrl+Q hoặc Alt+Q');
    }
  };

  const handleOpenSnipper = () => {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('open_snipper_window'))
        .catch(() => {});
    } else {
      showToast('⚡ Chế độ Desktop: Kích hoạt Snipper qua phím tắt Alt + S');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 font-sans antialiased select-none">
      <MainWindowLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        settings={settings}
        onUpdateSetting={updateSetting}
        recentSearches={recentSearches}
        onSelectWord={handleSelectMainWord}
        onShowToast={showToast}
        onOpenQuickHud={handleOpenQuickHud}
        onOpenSnipper={handleOpenSnipper}
        isTrayModalOpen={isTrayModalOpen}
        onSetTrayModalOpen={setIsTrayModalOpen}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2 z-50 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. ROOT ENTRY: ĐIỀU HƯỚNG CỬA SỔ DỰA TRÊN URL HASH (#hud vs #main)
// ============================================================================
export const App: React.FC = () => {
  const isHudRoute =
    typeof window !== 'undefined' &&
    (window.location.hash === '#hud' || window.location.href.includes('#hud'));

  if (isHudRoute) {
    return <StandaloneHudApp />;
  }

  const isSnipperRoute =
    typeof window !== 'undefined' &&
    (window.location.hash === '#snipper' || window.location.href.includes('#snipper'));

  if (isSnipperRoute) {
    return <ScreenSnipper />;
  }

  return <MainWindowApp />;
};

export default App;
