'use client';

import { useEffect } from 'react';
import { Button } from '@/components/livekit/button';
import { useAuthStatus, useDevLogin, useLogout } from '@/hooks/useAuth';

interface AuthHeaderProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export function AuthHeader({ onAuthChange }: AuthHeaderProps) {
  const { data: authStatus, isLoading } = useAuthStatus();
  const devLoginMutation = useDevLogin();
  const logoutMutation = useLogout();

  const isAuthenticated = authStatus?.isAuthenticated ?? false;

  useEffect(() => {
    if (!isLoading) {
      onAuthChange?.(isAuthenticated);
    }
  }, [isAuthenticated, isLoading, onAuthChange]);

  function handleDevLogin() {
    devLoginMutation.mutate();
  }

  function handleLogout() {
    logoutMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="h-9 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">✓ Dev Mode</div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="font-mono">
              Logout
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={handleDevLogin} className="font-mono">
            Dev Login
          </Button>
        )}
      </div>
    </div>
  );
}
