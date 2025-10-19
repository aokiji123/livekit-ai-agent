'use client';

import { useEffect, useRef } from 'react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useCreateSessionHistory } from '@/hooks/useSessionHistory';
import { useSession } from './session-provider';

export function SessionHistoryTracker() {
  const { isSessionActive, sessionHistoryData } = useSession();
  const messages = useChatMessages();
  const createSessionHistory = useCreateSessionHistory();
  const messagesRef = useRef<ReceivedChatMessage[]>([]);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (isSessionActive) {
      messagesRef.current = messages;
    }
  }, [messages, isSessionActive]);

  useEffect(() => {
    if (wasActiveRef.current && !isSessionActive) {
      const sessionData = sessionHistoryData.current;
      if (sessionData && messagesRef.current.length > 0) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - sessionData.startTime.getTime()) / 1000);

        const firstMessage = messagesRef.current.find((msg) => msg.from?.isLocal);
        const title = firstMessage?.message
          ? `${firstMessage.message.substring(0, 50)}${firstMessage.message.length > 50 ? '...' : ''}`
          : `Session ${sessionData.startTime.toLocaleString()}`;

        createSessionHistory.mutate({
          title,
          messages: messagesRef.current,
          startedAt: sessionData.startTime,
          endedAt: endTime,
          duration,
        });
      }

      sessionHistoryData.current = null;
      messagesRef.current = [];
    }

    wasActiveRef.current = isSessionActive;
  }, [isSessionActive, sessionHistoryData, createSessionHistory]);

  return null;
}
