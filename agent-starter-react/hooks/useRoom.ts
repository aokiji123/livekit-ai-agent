import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, TokenSource } from 'livekit-client';
import { AppConfig } from '@/app-config';
import { toastAlert } from '@/components/livekit/alert-toast';
import { useConnectionDetails } from './useConnectionDetails';
import { useConnectionResilience } from './useConnectionResilience';

export function useRoom(appConfig: AppConfig, promptInstructions?: string) {
  const aborted = useRef(false);
  const room = useMemo(() => new Room(), []);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const connectionDetailsMutation = useConnectionDetails(appConfig, promptInstructions);

  const fetchConnectionDetails = useCallback(async () => {
    const result = await connectionDetailsMutation.mutateAsync();
    return result;
  }, [connectionDetailsMutation]);

  const resilience = useConnectionResilience(room, {
    maxRetries: 5,
    initialRetryDelay: 1000,
    maxRetryDelay: 30000,
    enableSimulation: true,
    fetchConnectionDetails,
  });

  const onDisconnected = useCallback(() => {
    if (resilience.isSimulatingDisconnect || resilience.isConnecting) {
      return;
    }
    setIsSessionActive(false);
  }, [resilience.isSimulatingDisconnect, resilience.isConnecting]);

  const onConnected = useCallback(() => {
    setIsSessionActive(true);
  }, []);

  const onMediaDevicesError = useCallback((error: Error) => {
    toastAlert({
      title: 'Encountered an error with your media devices',
      description: `${error.name}: ${error.message}`,
    });
  }, []);

  useEffect(() => {
    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, onDisconnected, onConnected, onMediaDevicesError]);

  useEffect(() => {
    return () => {
      aborted.current = true;
      room.disconnect();
    };
  }, [room]);

  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        try {
          return await fetchConnectionDetails();
        } catch (error) {
          console.error('Error fetching connection details:', error);
          throw new Error('Error fetching connection details!');
        }
      }),
    [fetchConnectionDetails]
  );

  const startSession = useCallback(() => {
    setIsSessionActive(true);

    if (room.state === 'disconnected') {
      const { isPreConnectBufferEnabled } = appConfig;
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: isPreConnectBufferEnabled,
        }),
        tokenSource.fetch({ agentName: appConfig.agentName }).then((connectionDetails) => {
          resilience.storeConnectionDetails(
            connectionDetails.serverUrl,
            connectionDetails.participantToken
          );
          return room.connect(connectionDetails.serverUrl, connectionDetails.participantToken);
        }),
      ]).catch((error) => {
        if (aborted.current) {
          return;
        }

        toastAlert({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      });
    }
  }, [room, appConfig, tokenSource, resilience]);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    resilience.clearSimulation();
  }, [resilience]);

  return {
    room,
    isSessionActive,
    startSession,
    endSession,
    resilience,
  };
}
