import { type ReceivedChatMessage } from '@livekit/components-react';

export type SessionHistory = {
  id: string;
  title: string;
  messages: ReceivedChatMessage[];
  startedAt: Date;
  endedAt: Date;
  duration: number; // in seconds
};

export type SessionHistoryResponse = {
  success: boolean;
  data?: SessionHistory | SessionHistory[];
  error?: string;
};
