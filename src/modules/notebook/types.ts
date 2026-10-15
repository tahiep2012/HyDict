export interface FavoriteWordItem {
  id: string;
  word: string;
  pinyin: string;
  hanViet: string;
  definition: string;
  createdAt: number;
  tags?: string[];
}

export interface SearchHistoryItem {
  id: string;
  word: string;
  pinyin: string;
  hanViet: string;
  searchedAt: number;
}
