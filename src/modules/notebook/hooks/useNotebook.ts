import { useState, useEffect, useCallback } from 'react';
import { FavoriteWordItem, SearchHistoryItem } from '../types';
import {
  addFavorite as addFavRule,
  removeFavorite as removeFavRule,
  isFavorite as isFavRule,
  addHistoryItem as addHistRule,
  FAVORITES_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
} from '../rules';

const NOTEBOOK_SYNC_EVENT = 'hydict_notebook_updated';

function loadStoredFavorites(): FavoriteWordItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadStoredHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useNotebook() {
  const [favorites, setFavorites] = useState<FavoriteWordItem[]>(loadStoredFavorites);
  const [history, setHistory] = useState<SearchHistoryItem[]>(loadStoredHistory);

  // Đồng bộ giữa các tab / cửa sổ qua storage event và CustomEvent nội bộ
  const reloadFromStorage = useCallback(() => {
    setFavorites(loadStoredFavorites());
    setHistory(loadStoredHistory());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY || e.key === HISTORY_STORAGE_KEY) {
        reloadFromStorage();
      }
    };

    const handleCustomSync = () => {
      reloadFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(NOTEBOOK_SYNC_EVENT, handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(NOTEBOOK_SYNC_EVENT, handleCustomSync);
    };
  }, [reloadFromStorage]);

  const broadcastSync = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(NOTEBOOK_SYNC_EVENT));
    }
  };

  const addFavorite = useCallback(
    (item: Omit<FavoriteWordItem, 'id' | 'createdAt'>) => {
      setFavorites((prev) => {
        const next = addFavRule(prev, item);
        try {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
      broadcastSync();
    },
    []
  );

  const removeFavorite = useCallback((wordOrId: string) => {
    setFavorites((prev) => {
      const next = removeFavRule(prev, wordOrId);
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    broadcastSync();
  }, []);

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteWordItem, 'id' | 'createdAt'>) => {
      setFavorites((prev) => {
        const exists = isFavRule(prev, item.word);
        const next = exists ? removeFavRule(prev, item.word) : addFavRule(prev, item);
        try {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      broadcastSync();
    },
    []
  );

  const isFavorite = useCallback(
    (word: string) => {
      return isFavRule(favorites, word);
    },
    [favorites]
  );

  const addHistory = useCallback(
    (item: Omit<SearchHistoryItem, 'id' | 'searchedAt'>) => {
      setHistory((prev) => {
        const next = addHistRule(prev, item);
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      broadcastSync();
    },
    []
  );

  const removeHistory = useCallback((wordOrId: string) => {
    setHistory((prev) => {
      const target = wordOrId.trim().toLowerCase();
      const next = prev.filter(
        (h) => h.id.toLowerCase() !== target && h.word.toLowerCase() !== target
      );
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    broadcastSync();
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
    broadcastSync();
  }, []);

  return {
    favorites,
    history,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    addHistory,
    removeHistory,
    clearHistory,
    reloadFromStorage,
  };
}
