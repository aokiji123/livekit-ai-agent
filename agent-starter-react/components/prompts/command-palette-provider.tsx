'use client';

import { useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { CommandPalette } from './command-palette';

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true,
      callback: () => setIsOpen(true),
    },
  ]);

  return (
    <>
      {children}
      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
