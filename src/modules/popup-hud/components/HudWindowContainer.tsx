import React from 'react';
import { HudTitlebar } from './HudTitlebar';
import { Card } from '@/components/ui';

export interface HudWindowContainerProps {
  isOpen: boolean;
  isPinned: boolean;
  onClose: () => void;
  onTogglePin: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  // Lingoes Controls
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
  onPlayAudio?: () => void;
  onHistoryBack?: () => void;
  onHistoryForward?: () => void;
  canHistoryBack?: boolean;
  canHistoryForward?: boolean;
  onCopyDefinition?: () => void;
  onOpenMainWindow?: () => void;
}

export const HudWindowContainer: React.FC<HudWindowContainerProps> = ({
  isOpen,
  isPinned,
  onClose,
  onTogglePin,
  title,
  children,
  className = '',
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onPlayAudio,
  onHistoryBack,
  onHistoryForward,
  canHistoryBack,
  canHistoryForward,
  onCopyDefinition,
  onOpenMainWindow,
}) => {
  if (!isOpen) return null;

  return (
    <Card
      variant="hud"
      rounded="2xl"
      className={`w-full max-w-[480px] bg-white overflow-hidden flex flex-col border border-slate-200/90 shadow-2xl ${className}`}
    >
      <HudTitlebar
        title={title}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        onClose={onClose}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onPlayAudio={onPlayAudio}
        onHistoryBack={onHistoryBack}
        onHistoryForward={onHistoryForward}
        canHistoryBack={canHistoryBack}
        canHistoryForward={canHistoryForward}
        onCopyDefinition={onCopyDefinition}
        onOpenMainWindow={onOpenMainWindow}
      />
      <div className="p-3.5 overflow-y-auto max-h-[500px] space-y-3 bg-white">
        {children}
      </div>
    </Card>
  );
};
