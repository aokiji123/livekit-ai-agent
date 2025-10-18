import { usePromptContext } from './prompt-context';

interface SelectedPromptDisplayProps {
  className?: string;
}

export function SelectedPromptDisplay({ className }: SelectedPromptDisplayProps) {
  const { selectedPrompt } = usePromptContext();

  if (!selectedPrompt) return null;

  return (
    <div className={`bg-muted/50 space-y-2 rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{selectedPrompt.title}</h3>
        <span className="text-muted-foreground text-xs">v{selectedPrompt.version}</span>
      </div>

      <p className="text-muted-foreground line-clamp-3 text-sm">{selectedPrompt.body}</p>

      {selectedPrompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedPrompt.tags.map((tag) => (
            <span key={tag} className="bg-muted rounded px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
