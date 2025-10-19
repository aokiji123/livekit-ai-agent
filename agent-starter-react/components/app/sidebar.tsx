'use client';

import { useState } from 'react';
import { Button } from '@/components/livekit/button';
import { usePromptContext } from '@/components/prompts/prompt-context';
import { useDeletePrompt, usePrompts } from '@/hooks/usePrompts';
import { useDeleteSessionHistory, useSessionHistory } from '@/hooks/useSessionHistory';
import { Prompt } from '@/lib/types/prompt';
import { useSession } from './session-provider';

interface SidebarProps {
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

export function Sidebar({ className }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const { data: prompts, isLoading: promptsLoading } = usePrompts(searchQuery);
  const { data: sessions, isLoading: sessionsLoading } = useSessionHistory();
  const deletePrompt = useDeletePrompt();
  const deleteSession = useDeleteSessionHistory();
  const { selectedPrompt, setSelectedPrompt } = usePromptContext();
  const { isSessionActive } = useSession();

  const allTags = Array.from(new Set(prompts?.flatMap((p) => p.tags) || [])).sort();

  const filteredPrompts = prompts?.filter(
    (prompt) => selectedTags.length === 0 || selectedTags.some((tag) => prompt.tags.includes(tag))
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePromptSelect = (prompt: Prompt) => {
    const newPrompt = selectedPrompt?.id === prompt.id ? null : prompt;

    if (isSessionActive && selectedPrompt?.id !== prompt.id) {
      const willRestart = confirm(
        'Changing the prompt will restart your current session. Continue?'
      );
      if (!willRestart) {
        return;
      }
    }

    setSelectedPrompt(newPrompt);
  };

  const handleDeletePrompt = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this prompt?')) return;
    await deletePrompt.mutateAsync(id);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this session?')) return;
    await deleteSession.mutateAsync(id);
  };

  const toggleSection = (id: string) => {
    setExpandedSectionId((prev) => (prev === id ? null : id));
  };

  return (
    <aside className={`bg-muted/30 flex h-full flex-col overflow-hidden border-r ${className}`}>
      <div className="flex-1 overflow-y-auto border-b">
        <div className="bg-background sticky top-0 z-10 border-b p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prompts</h2>
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/prompts')}>
              Manage
            </Button>
          </div>

          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background focus:ring-primary mb-3 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-md px-2 py-1 text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          {promptsLoading ? (
            <p className="text-muted-foreground text-center text-sm">Loading...</p>
          ) : filteredPrompts?.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm">No prompts found</p>
          ) : (
            filteredPrompts?.map((prompt) => (
              <div
                key={prompt.id}
                className={`hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedPrompt?.id === prompt.id ? 'bg-primary/10 border-primary' : 'bg-card'
                }`}
                onClick={() => handlePromptSelect(prompt)}
              >
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="flex-1 text-sm font-medium">{prompt.title}</h3>
                  <button
                    onClick={(e) => handleDeletePrompt(prompt.id, e)}
                    className="text-muted-foreground hover:text-destructive ml-2 text-xs"
                  >
                    ×
                  </button>
                </div>
                <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">{prompt.body}</p>
                {prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="bg-muted rounded px-1.5 py-0.5 text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-background sticky top-0 z-10 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Sessions</h2>
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/history')}>
              View All
            </Button>
          </div>
        </div>

        <div className="space-y-2 p-4">
          {sessionsLoading ? (
            <p className="text-muted-foreground text-center text-sm">Loading...</p>
          ) : sessions?.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm">No sessions yet</p>
          ) : (
            sessions?.slice(0, 5).map((session) => (
              <div key={session.id} className="bg-card rounded-lg border p-3">
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="line-clamp-1 flex-1 text-sm font-medium">{session.title}</h3>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="text-muted-foreground hover:text-destructive ml-2 text-xs"
                  >
                    ×
                  </button>
                </div>
                <div className="text-muted-foreground mb-2 text-xs">
                  <div>{new Date(session.startedAt).toLocaleDateString()}</div>
                  <div>
                    {formatDuration(session.duration)} • {session.messages.length} messages
                  </div>
                </div>
                <button
                  onClick={() => toggleSection(session.id)}
                  className="text-primary text-xs hover:underline"
                >
                  {expandedSectionId === session.id ? 'Hide' : 'View'}
                </button>
                {expandedSectionId === session.id && (
                  <div className="mt-2 space-y-1.5 border-t pt-2">
                    {session.messages.slice(0, 3).map((message) => (
                      <div
                        key={message.id}
                        className={`rounded p-2 text-xs ${
                          message.from?.isLocal ? 'bg-primary/10 ml-2' : 'bg-muted mr-2'
                        }`}
                      >
                        <div className="text-muted-foreground mb-0.5 text-[10px] font-medium">
                          {message.from?.isLocal ? 'You' : 'Agent'}
                        </div>
                        <p className="line-clamp-2">{message.message}</p>
                      </div>
                    ))}
                    {session.messages.length > 3 && (
                      <p className="text-muted-foreground text-center text-[10px]">
                        +{session.messages.length - 3} more messages
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
