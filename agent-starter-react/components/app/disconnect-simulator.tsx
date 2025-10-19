'use client';

import { useState } from 'react';
import { Button } from '@/components/livekit/button';
import { useSession } from './session-provider';

interface DisconnectSimulatorProps {
  className?: string;
}

export function DisconnectSimulator({ className }: DisconnectSimulatorProps) {
  const { resilience, isSessionActive } = useSession();
  const [isSimulating, setIsSimulating] = useState(false);

  if (!resilience || !isSessionActive) {
    return null;
  }

  const handleSimulateDisconnect = async () => {
    setIsSimulating(true);
    try {
      await resilience.simulateDisconnect();
    } finally {
      // Reset after simulation completes (3s + reconnection time)
      setTimeout(() => {
        setIsSimulating(false);
      }, 5000);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Connection Testing</h3>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-lg border p-3">
        <p className="text-muted-foreground text-xs">
          Test connection resilience by simulating a network disconnect.
        </p>

        {resilience.isConnecting && (
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-600 dark:bg-yellow-500"></div>
            <span>
              {resilience.retryCount > 0
                ? `Reconnecting... (attempt ${resilience.retryCount})`
                : 'Connecting...'}
            </span>
          </div>
        )}

        {resilience.isSimulatingDisconnect && (
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400"></div>
            <span>Simulation in progress...</span>
          </div>
        )}

        {resilience.lastError && !resilience.isConnecting && (
          <div className="bg-destructive/10 text-destructive rounded p-2 text-xs">
            <strong>Error:</strong> {resilience.lastError.message}
          </div>
        )}

        <Button
          onClick={handleSimulateDisconnect}
          disabled={isSimulating || resilience.isConnecting || resilience.isSimulatingDisconnect}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isSimulating || resilience.isSimulatingDisconnect
            ? 'Simulating...'
            : 'Simulate Disconnect'}
        </Button>

        <div className="text-muted-foreground space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>Max Retries:</span>
            <span className="font-medium">5</span>
          </div>
          <div className="flex justify-between">
            <span>Initial Delay:</span>
            <span className="font-medium">1s</span>
          </div>
          <div className="flex justify-between">
            <span>Max Delay:</span>
            <span className="font-medium">30s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
