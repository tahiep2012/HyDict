import { useState, useEffect } from 'react';

export interface UseGlobalHotkeyOptions {
  hotkey?: string;
  onTrigger?: () => void;
  onEscape?: () => void;
}

export function useGlobalHotkey({
  hotkey = 'Alt+Q',
  onTrigger,
  onEscape,
}: UseGlobalHotkeyOptions = {}) {
  const [lastTriggered, setLastTriggered] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Phím Esc
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      // Phím Alt + Q
      if (hotkey === 'Alt+Q' && e.altKey && (e.key === 'Q' || e.key === 'q')) {
        e.preventDefault();
        setLastTriggered(Date.now());
        if (onTrigger) onTrigger();
      }

      // Phím Shift + T
      if (hotkey === 'Shift+T' && e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        setLastTriggered(Date.now());
        if (onTrigger) onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkey, onTrigger, onEscape]);

  return { lastTriggered };
}
