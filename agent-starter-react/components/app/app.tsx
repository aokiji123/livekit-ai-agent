'use client';

import { useState } from 'react';
import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppConfig } from '@/app-config';
import { AuthHeader } from '@/components/app/auth-header';
import { SessionProvider } from '@/components/app/session-provider';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';

interface AppProps {
  appConfig: AppConfig;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function App({ appConfig }: AppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider appConfig={appConfig}>
        <AuthHeader onAuthChange={setIsAuthenticated} />
        <main className="grid h-svh grid-cols-1 place-content-center">
          <ViewController isAuthenticated={isAuthenticated} />
        </main>
        <StartAudio label="Start Audio" />
        <RoomAudioRenderer />
        <Toaster />
      </SessionProvider>
    </QueryClientProvider>
  );
}
