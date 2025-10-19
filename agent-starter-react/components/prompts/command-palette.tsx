'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePrompts } from '../../hooks/usePrompts';
import { Prompt } from '../../lib/types/prompt';
import { cn } from '../../lib/utils';
import { usePromptContext } from './prompt-context';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: prompts, isLoading } = usePrompts(search);
  const { selectedPrompt, setSelectedPrompt } = usePromptContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredPrompts = useMemo(() => prompts || [], [prompts]);

  const handleSelect = useCallback(
    (prompt: Prompt | null) => {
      setSelectedPrompt(prompt);
      onClose();
    },
    [onClose, setSelectedPrompt]
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPrompts.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredPrompts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const prompt = filteredPrompts[selectedIndex];
        if (prompt) handleSelect(prompt);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredPrompts, selectedIndex, handleSelect, onClose]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center pt-[20vh] duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div
        className="animate-in fade-in absolute inset-0 bg-black/50 backdrop-blur-sm duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="animate-in slide-in-from-top-4 relative mx-4 w-full max-w-2xl duration-300"
        role="document"
      >
        <div className="bg-background overflow-hidden rounded-lg border shadow-xl">
          <div className="border-b p-4">
            <label htmlFor="command-search" id="command-palette-title" className="sr-only">
              Search prompts
            </label>
            <input
              ref={inputRef}
              id="command-search"
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="placeholder:text-muted-foreground w-full border-none bg-transparent text-lg outline-none"
              role="searchbox"
              aria-controls="command-palette-list"
              aria-activedescendant={
                filteredPrompts[selectedIndex]
                  ? `prompt-${filteredPrompts[selectedIndex].id}`
                  : undefined
              }
            />
          </div>

          <div
            id="command-palette-list"
            ref={listRef}
            className="max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="Prompt list"
          >
            {isLoading ? (
              <div className="text-muted-foreground p-4 text-center" role="status">
                Loading prompts...
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center" role="alert">
                {search ? 'No prompts found' : 'No prompts available'}
              </div>
            ) : (
              filteredPrompts.map((prompt, index) => (
                <button
                  key={prompt.id}
                  id={`prompt-${prompt.id}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSelect(prompt)}
                  className={cn(
                    'hover:bg-muted w-full p-3 text-left transition-colors',
                    selectedIndex === index && 'bg-muted',
                    selectedPrompt?.id === prompt.id && 'bg-primary/10'
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{prompt.title}</div>
                      <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {prompt.body}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">v{prompt.version}</span>
                        {prompt.tags.length > 0 && (
                          <div className="flex gap-1">
                            {prompt.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="bg-muted rounded px-1.5 py-0.5 text-xs">
                                {tag}
                              </span>
                            ))}
                            {prompt.tags.length > 3 && (
                              <span className="text-muted-foreground text-xs">
                                +{prompt.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedPrompt?.id === prompt.id && (
                      <div className="text-primary ml-2 text-xs font-medium">Selected</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="bg-muted/30 border-t p-3">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="flex items-center gap-4" aria-hidden="true">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <span>
                {filteredPrompts.length} prompt
                {filteredPrompts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
