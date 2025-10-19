import { useState } from 'react';
import { usePrompts } from '../../hooks/usePrompts';
import { Prompt } from '../../lib/types/prompt';
import { Button } from '../livekit/button';

interface PromptSelectorProps {
  onPromptSelect?: (prompt: Prompt | null) => void;
  selectedPromptId?: string;
  className?: string;
}

export function PromptSelector({
  onPromptSelect,
  selectedPromptId,
  className,
}: PromptSelectorProps) {
  const [search, setSearch] = useState('');
  const { data: prompts, isLoading } = usePrompts(search);
  const [isOpen, setIsOpen] = useState(false);

  const selectedPrompt = prompts?.find((p) => p.id === selectedPromptId);

  const handleSelect = (promptId: string) => {
    const prompt = prompts?.find((p) => p.id === promptId) || null;
    onPromptSelect?.(prompt);
    setIsOpen(false);
  };

  const handleClear = () => {
    onPromptSelect?.(null);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2"
        >
          <span className="truncate">
            {selectedPrompt ? selectedPrompt.title : 'Select a prompt...'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {selectedPrompt ? `v${selectedPrompt.version}` : ''}
            </span>
            <kbd className="bg-muted pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>

        {selectedPrompt && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="bg-background absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border shadow-lg">
          <div className="border-b p-2">
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-primary w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                Loading prompts...
              </div>
            ) : prompts?.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                {search ? 'No prompts found' : 'No prompts available'}
              </div>
            ) : (
              prompts?.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelect(prompt.id)}
                  className={`hover:bg-muted w-full p-3 text-left transition-colors ${
                    selectedPromptId === prompt.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="text-sm font-medium">{prompt.title}</div>
                  <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {prompt.body}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">v{prompt.version}</span>
                    {prompt.tags.length > 0 && (
                      <div className="flex gap-1">
                        {prompt.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="bg-muted rounded px-1.5 py-0.5 text-xs">
                            {tag}
                          </span>
                        ))}
                        {prompt.tags.length > 2 && (
                          <span className="text-muted-foreground text-xs">
                            +{prompt.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
