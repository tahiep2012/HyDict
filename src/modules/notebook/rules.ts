import { FavoriteWordItem, SearchHistoryItem } from './types';

export const MAX_HISTORY_ITEMS = 100;
export const FAVORITES_STORAGE_KEY = 'hydict_favorites';
export const HISTORY_STORAGE_KEY = 'hydict_search_history';

/**
 * Thêm một từ vựng vào danh sách yêu thích (đưa lên đầu, không trùng lặp)
 */
export function addFavorite(
  favorites: FavoriteWordItem[],
  item: Omit<FavoriteWordItem, 'id' | 'createdAt'>
): FavoriteWordItem[] {
  const cleanWord = item.word.trim();
  if (!cleanWord) return favorites;

  const existingIdx = favorites.findIndex((f) => f.word.toLowerCase() === cleanWord.toLowerCase());
  const newItem: FavoriteWordItem = {
    id: cleanWord,
    word: cleanWord,
    pinyin: item.pinyin,
    hanViet: item.hanViet,
    definition: item.definition,
    createdAt: Date.now(),
    tags: item.tags || [],
  };

  if (existingIdx !== -1) {
    // Cập nhật và đưa lên đầu
    const filtered = favorites.filter((_, idx) => idx !== existingIdx);
    return [newItem, ...filtered];
  }

  return [newItem, ...favorites];
}

/**
 * Xóa một từ khỏi danh sách yêu thích
 */
export function removeFavorite(
  favorites: FavoriteWordItem[],
  wordOrId: string
): FavoriteWordItem[] {
  const target = wordOrId.trim().toLowerCase();
  return favorites.filter(
    (item) => item.id.toLowerCase() !== target && item.word.toLowerCase() !== target
  );
}

/**
 * Kiểm tra xem một từ đã có trong danh sách yêu thích hay chưa
 */
export function isFavorite(favorites: FavoriteWordItem[], word: string): boolean {
  if (!word) return false;
  const clean = word.trim().toLowerCase();
  return favorites.some((item) => item.word.toLowerCase() === clean || item.id.toLowerCase() === clean);
}

/**
 * Thêm một mục vào lịch sử tra cứu (tối đa 100 mục, đưa lên đầu, chống trùng lặp)
 */
export function addHistoryItem(
  history: SearchHistoryItem[],
  item: Omit<SearchHistoryItem, 'id' | 'searchedAt'>,
  maxItems: number = MAX_HISTORY_ITEMS
): SearchHistoryItem[] {
  const cleanWord = item.word.trim();
  if (!cleanWord) return history;

  const filtered = history.filter((h) => h.word.toLowerCase() !== cleanWord.toLowerCase());
  const newItem: SearchHistoryItem = {
    id: `${cleanWord}_${Date.now()}`,
    word: cleanWord,
    pinyin: item.pinyin,
    hanViet: item.hanViet,
    searchedAt: Date.now(),
  };

  return [newItem, ...filtered].slice(0, maxItems);
}

/**
 * Lọc danh sách từ yêu thích theo từ khóa tìm kiếm
 */
export function filterFavorites(
  favorites: FavoriteWordItem[],
  query: string
): FavoriteWordItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return favorites;

  return favorites.filter((item) => {
    return (
      item.word.toLowerCase().includes(q) ||
      item.pinyin.toLowerCase().includes(q) ||
      item.hanViet.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q)
    );
  });
}

/**
 * Lọc danh sách lịch sử theo từ khóa tìm kiếm
 */
export function filterHistory(
  history: SearchHistoryItem[],
  query: string
): SearchHistoryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return history;

  return history.filter((item) => {
    return (
      item.word.toLowerCase().includes(q) ||
      item.pinyin.toLowerCase().includes(q) ||
      item.hanViet.toLowerCase().includes(q)
    );
  });
}
