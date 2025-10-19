import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionState, DisconnectReason, Room, RoomEvent } from 'livekit-client';
import { toastAlert } from '@/components/livekit/alert-toast';

interface ConnectionResilienceConfig {
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  enableSimulation?: boolean;
  fetchConnectionDetails?: () => Promise<{ serverUrl: string; participantToken: string }>;
}

interface ConnectionResilienceState {
  isConnecting: boolean;
  retryCount: number;
  lastError: Error | null;
  isSimulatingDisconnect: boolean;
}

const DEFAULT_CONFIG: Omit<Required<ConnectionResilienceConfig>, 'fetchConnectionDetails'> = {
  maxRetries: 5,
  initialRetryDelay: 1000,
  maxRetryDelay: 30000,
  enableSimulation: true,
};

export function useConnectionResilience(room: Room, config: ConnectionResilienceConfig = {}) {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const [state, setState] = useState<ConnectionResilienceState>({
    isConnecting: false,
    retryCount: 0,
    lastError: null,
    isSimulatingDisconnect: false,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRetryingRef = useRef(false);
  const lastConnectionDetailsRef = useRef<{ serverUrl: string; participantToken: string } | null>(
    null
  );
  const isMountedRef = useRef(true);
  const isSimulatingRef = useRef(false);

  const getRetryDelay = useCallback(
    (count: number) =>
      Math.min(mergedConfig.initialRetryDelay * Math.pow(2, count), mergedConfig.maxRetryDelay) +
      Math.random() * 1000,
    [mergedConfig.initialRetryDelay, mergedConfig.maxRetryDelay]
  );

  const safeSetState = useCallback(
    (updater: (prev: ConnectionResilienceState) => ConnectionResilienceState) => {
      if (isMountedRef.current) setState(updater);
    },
    []
  );

  const attemptReconnect = useCallback(async () => {
    if (!lastConnectionDetailsRef.current) throw new Error('Missing connection details');

    const { serverUrl, participantToken } = lastConnectionDetailsRef.current;

    await Promise.all([
      room.connect(serverUrl, participantToken),
      room.localParticipant.setMicrophoneEnabled(true),
    ]);
  }, [room]);

  const scheduleRetry = useCallback(
    (retryCount: number) => {
      if (retryCount >= mergedConfig.maxRetries) {
        toastAlert({
          title: 'Connection Failed',
          description: `Unable to reconnect after ${mergedConfig.maxRetries} attempts.`,
        });
        safeSetState((prev) => ({ ...prev, isConnecting: false }));
        return;
      }

      const delay = getRetryDelay(retryCount);
      const seconds = Math.round(delay / 1000);
      toastAlert({
        title: 'Reconnecting...',
        description: `Retrying in ${seconds}s (attempt ${retryCount + 1}/${mergedConfig.maxRetries})`,
      });

      retryTimeoutRef.current = setTimeout(async () => {
        if (isSimulatingRef.current) return;

        try {
          safeSetState((prev) => ({ ...prev, isConnecting: true, retryCount: retryCount + 1 }));
          if (mergedConfig.fetchConnectionDetails) {
            lastConnectionDetailsRef.current = await mergedConfig.fetchConnectionDetails();
          }

          await attemptReconnect();

          toastAlert({ title: 'Reconnected', description: 'Successfully reconnected.' });
          safeSetState((prev) => ({
            ...prev,
            isConnecting: false,
            retryCount: 0,
            lastError: null,
          }));
          isRetryingRef.current = false;
        } catch (err) {
          console.error('Retry failed:', err);
          safeSetState((prev) => ({ ...prev, lastError: err as Error }));
          scheduleRetry(retryCount + 1);
        }
      }, delay);
    },
    [attemptReconnect, getRetryDelay, mergedConfig, safeSetState]
  );

  const handleDisconnected = useCallback(
    (reason?: DisconnectReason) => {
      if (
        isSimulatingRef.current ||
        reason === DisconnectReason.CLIENT_INITIATED ||
        isRetryingRef.current
      ) {
        return;
      }

      toastAlert({
        title: 'Connection Lost',
        description: 'Lost connection. Attempting to reconnect...',
      });

      isRetryingRef.current = true;
      scheduleRetry(0);
    },
    [scheduleRetry]
  );

  const handleConnectionStateChange = useCallback(
    (state: ConnectionState) => {
      if (state === 'connected') {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        isRetryingRef.current = false;
        safeSetState((prev) => ({ ...prev, isConnecting: false, retryCount: 0, lastError: null }));
      } else if (state === 'reconnecting') {
        safeSetState((prev) => ({ ...prev, isConnecting: true }));
      }
    },
    [safeSetState]
  );

  const simulateDisconnect = useCallback(async () => {
    if (!mergedConfig.enableSimulation) {
      console.warn('Simulation disabled');
      return;
    }

    isSimulatingRef.current = true;
    safeSetState((prev) => ({ ...prev, isSimulatingDisconnect: true }));

    toastAlert({ title: 'Simulating Disconnect', description: 'Disconnecting for testing...' });
    await room.disconnect();

    setTimeout(async () => {
      if (!mergedConfig.fetchConnectionDetails) return;

      try {
        const details = await mergedConfig.fetchConnectionDetails();
        lastConnectionDetailsRef.current = details;
        await attemptReconnect();

        toastAlert({ title: 'Simulation Complete', description: 'Reconnected successfully.' });
      } catch (err) {
        console.error('Simulation reconnect failed:', err);
        safeSetState((prev) => ({ ...prev, lastError: err as Error }));
        scheduleRetry(0);
      } finally {
        safeSetState((prev) => ({ ...prev, isSimulatingDisconnect: false }));
        isSimulatingRef.current = false;
      }
    }, 3000);
  }, [attemptReconnect, mergedConfig, scheduleRetry, safeSetState, room]);

  const storeConnectionDetails = useCallback((serverUrl: string, participantToken: string) => {
    lastConnectionDetailsRef.current = { serverUrl, participantToken };
  }, []);

  const clearSimulation = useCallback(() => {
    safeSetState((prev) => ({ ...prev, isSimulatingDisconnect: false }));
  }, [safeSetState]);

  useEffect(() => {
    isMountedRef.current = true;
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);

    return () => {
      isMountedRef.current = false;
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [room, handleDisconnected, handleConnectionStateChange]);

  return {
    ...state,
    storeConnectionDetails,
    simulateDisconnect,
    clearSimulation,
  };
}
