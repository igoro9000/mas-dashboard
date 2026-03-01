const SUGGESTED_PROMPTS = [
  "What tasks are currently running?",
  "Show me recent errors",
  "Create a new task",
  "List all active agents",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  prompts?: string[];
}

export function SuggestedPrompts({ onSelect, prompts = SUGGESTED_PROMPTS }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4">
      <p className="text-sm text-muted-foreground">
        Get started with a suggested prompt
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="
              min-h-[44px]
              px-4
              py-2
              rounded-full
              bg-muted
              text-muted-foreground
              text-sm
              font-medium
              border
              border-border
              transition-colors
              duration-150
              hover:bg-accent
              hover:text-accent-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              cursor-pointer
            "
            type="button"
            aria-label={`Use suggested prompt: ${prompt}`}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}