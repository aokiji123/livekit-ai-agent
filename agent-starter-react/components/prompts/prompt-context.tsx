'use client';

import React, { createContext, useContext, useState } from 'react';
import { Prompt } from '../lib/types/prompt';

interface PromptContextType {
  selectedPrompt: Prompt | null;
  setSelectedPrompt: (prompt: Prompt | null) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  return (
    <PromptContext.Provider value={{ selectedPrompt, setSelectedPrompt }}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptContext() {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
}
