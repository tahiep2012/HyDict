import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { FavoriteWordItem } from '../types';
import { useNotebook } from '../hooks/useNotebook';

export interface BookmarkButtonProps {
  wordItem: Omit<FavoriteWordItem, 'id' | 'createdAt'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  wordItem,
  className = '',
  size = 'md',
  showLabel = false,
  onToggle,
}) => {
  const { isFavorite, toggleFavorite } = useNotebook();
  const bookmarked = isFavorite(wordItem.word);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);

    toggleFavorite(wordItem);
    if (onToggle) {
      onToggle(!bookmarked);
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonPadding = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none ${
        buttonPadding[size]
      } ${
        bookmarked
          ? 'text-amber-500 hover:text-amber-600 bg-amber-50/60 hover:bg-amber-100/80 shadow-2xs'
          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
      } ${isBouncing ? 'scale-125' : 'scale-100'} ${className}`}
      title={bookmarked ? 'Bỏ lưu khỏi Sổ tay từ yêu thích' : 'Lưu vào Sổ tay từ yêu thích (⭐)'}
    >
      <Star
        className={`${iconSizes[size]} transition-all duration-200 ${
          bookmarked ? 'fill-amber-400 text-amber-500' : 'fill-none'
        }`}
      />
      {showLabel && (
        <span className="text-xs font-semibold">
          {bookmarked ? 'Đã lưu' : 'Lưu từ'}
        </span>
      )}
    </button>
  );
};
