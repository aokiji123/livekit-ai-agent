'use client';

import { useState } from 'react';
import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AuthHeader } from '@/components/app/auth-header';
import { SessionProvider } from '@/components/app/session-provider';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { useAuthStatus } from '@/hooks/useAuth';

interface AppProps {
  appConfig: AppConfig;
}

function AppContent({ appConfig }: AppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: authStatus, isLoading } = useAuthStatus();

  return (
    <>
      {!isLoading && <AuthHeader onAuthChange={setIsAuthenticated} />}
      <main className="grid h-svh grid-cols-1 place-content-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <ViewController isAuthenticated={isAuthenticated} />
        )}
      </main>
    </>
  );
}

export function App({ appConfig }: AppProps) {
  return (
    <SessionProvider appConfig={appConfig}>
      <AppContent appConfig={appConfig} />
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
