'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/livekit/button';
import { useDeleteSessionHistory, useSessionHistory } from '@/hooks/useSessionHistory';
import { SessionHistory } from '@/lib/types/session-history';

interface SessionHistoryDashboardProps {
  className?: string;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function SessionHistoryDashboard({ className }: SessionHistoryDashboardProps) {
  const [selectedSession, setSelectedSession] = useState<SessionHistory | null>(null);
  const { data: sessions, isLoading } = useSessionHistory();
  const deleteSession = useDeleteSessionHistory();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await deleteSession.mutateAsync(id);
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSelectSession = (session: SessionHistory) => {
    setSelectedSession(selectedSession?.id === session.id ? null : session);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Session History</h1>
          <p className="text-muted-foreground">View your recent conversations (last 10 sessions)</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-center">Loading history...</div>
        ) : sessions?.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No session history yet. Start a conversation to see your history here.
          </div>
        ) : (
          sessions?.map((session) => (
            <div key={session.id} className="bg-card space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{session.title}</h3>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>{formatDateTime(session.startedAt)}</span>
                    <span>Duration: {formatDuration(session.duration)}</span>
                    <span>
                      {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSelectSession(session)}>
                    {selectedSession?.id === session.id ? 'Hide' : 'View'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {selectedSession?.id === session.id && (
                <div className="bg-muted/50 mt-4 rounded-md p-4">
                  <h4 className="mb-3 text-sm font-medium">Conversation</h4>
                  {session.messages.length > 0 ? (
                    <div className="space-y-2">
                      {session.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-lg p-3 ${
                            message.from?.isLocal
                              ? 'bg-primary/10 ml-auto max-w-[80%]'
                              : 'bg-muted mr-auto max-w-[80%]'
                          }`}
                        >
                          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                            <span className="font-medium">
                              {message.from?.isLocal ? 'You' : 'Agent'}
                            </span>
                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No messages in this session</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
