import { useCallback, useEffect } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcutOptions[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      shortcuts.forEach(
        ({ key, metaKey, ctrlKey, shiftKey, altKey, callback, preventDefault = true }) => {
          const isMetaPressed = metaKey ? event.metaKey : !event.metaKey;
          const isCtrlPressed = ctrlKey ? event.ctrlKey : !event.ctrlKey;
          const isShiftPressed = shiftKey ? event.shiftKey : !event.shiftKey;
          const isAltPressed = altKey ? event.altKey : !event.altKey;

          if (
            event.key.toLowerCase() === key.toLowerCase() &&
            isMetaPressed &&
            isCtrlPressed &&
            isShiftPressed &&
            isAltPressed
          ) {
            if (preventDefault) {
              event.preventDefault();
            }
            callback();
          }
        }
      );
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
