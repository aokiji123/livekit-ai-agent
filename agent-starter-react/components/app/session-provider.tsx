'use client';

import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { RoomContext } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS, type AppConfig } from '@/app-config';
import { useAgentPrompt } from '@/hooks/useAgentPrompt';
import { useRoom } from '@/hooks/useRoom';

export type SessionHistoryData = {
  startTime: Date;
};

const SessionContext = createContext<{
  appConfig: AppConfig;
  isSessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
  sessionHistoryData: React.MutableRefObject<SessionHistoryData | null>;
}>({
  appConfig: APP_CONFIG_DEFAULTS,
  isSessionActive: false,
  startSession: () => {},
  endSession: () => {},
  sessionHistoryData: { current: null },
});

interface SessionProviderProps {
  appConfig: AppConfig;
  children: React.ReactNode;
}

export const SessionProvider = ({ appConfig, children }: SessionProviderProps) => {
  const { agentInstructions } = useAgentPrompt();
  const {
    room,
    isSessionActive,
    startSession: startRoomSession,
    endSession: endRoomSession,
  } = useRoom(appConfig, agentInstructions);

  const sessionHistoryData = useRef<SessionHistoryData | null>(null);

  const startSession = useCallback(() => {
    sessionHistoryData.current = { startTime: new Date() };
    startRoomSession();
  }, [startRoomSession]);

  const endSession = useCallback(() => {
    endRoomSession();
  }, [endRoomSession]);

  const contextValue = useMemo(
    () => ({ appConfig, isSessionActive, startSession, endSession, sessionHistoryData }),
    [appConfig, isSessionActive, startSession, endSession, sessionHistoryData]
  );

  return (
    <RoomContext.Provider value={room}>
      <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
    </RoomContext.Provider>
  );
};

export function useSession() {
  return useContext(SessionContext);
}
