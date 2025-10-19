'use client';

import { useEffect, useRef } from 'react';
import { usePromptContext } from '@/components/prompts/prompt-context';
import { useSession } from './session-provider';

export function PromptSessionHandler() {
  const { selectedPrompt } = usePromptContext();
  const { isSessionActive, endSession, startSession } = useSession();
  const previousPromptIdRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const currentPromptId = selectedPrompt?.id || null;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPromptIdRef.current = currentPromptId;
      return;
    }

    if (isSessionActive && previousPromptIdRef.current !== currentPromptId) {
      endSession();

      const timeoutId = setTimeout(() => {
        startSession();
      }, 500);

      previousPromptIdRef.current = currentPromptId;

      return () => clearTimeout(timeoutId);
    }

    previousPromptIdRef.current = currentPromptId;
  }, [selectedPrompt, isSessionActive, endSession, startSession]);

  return null;
}
