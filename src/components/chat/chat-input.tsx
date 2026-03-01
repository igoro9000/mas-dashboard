"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  isEmpty?: boolean;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput({ onSend, onStop, isStreaming, isEmpty = false }, ref) {
    const [value, setValue] = useState("");
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const wasStreamingRef = useRef(false);

    // Auto-focus textarea only after streaming ends (not on initial mount)
    useEffect(() => {
      if (isStreaming) {
        wasStreamingRef.current = true;
        return;
      }
      if (!wasStreamingRef.current) return;
      wasStreamingRef.current = false;
      const el =
        ref && typeof ref === "object" && ref.current
          ? ref.current
          : internalRef.current;
      if (el) {
        el.focus();
      }
    }, [isStreaming, ref]);

    const handleSend = (text?: string) => {
      const trimmed = (text ?? value).trim();
      if (!trimmed || isStreaming) return;
      onSend(trimmed);
      setValue("");
      const el =
        ref && typeof ref === "object" && ref.current
          ? ref.current
          : internalRef.current;
      if (el) {
        el.style.height = "auto";
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleInput = () => {
      const el =
        ref && typeof ref === "object" && ref.current
          ? ref.current
          : internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    const handleSuggestedPrompt = (prompt: string) => {
      setValue(prompt);
      // Auto-submit the suggested prompt
      handleSend(prompt);
    };

    const showSuggestions = isEmpty && value.trim() === "";

    // Combine refs so both internal and forwarded refs point to the same element
    const setRefs = (el: HTMLTextAreaElement | null) => {
      (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      }
    };

    return (
      <div
        className="border-t bg-background px-3 py-2"
        style={{
          paddingBottom:
            "calc(env(safe-area-inset-bottom) + var(--keyboard-height, 0px) + 0.5rem)",
        }}
      >
        {showSuggestions && (
          <div className="max-w-lg mx-auto mb-2">
            <SuggestedPrompts onSelect={handleSuggestedPrompt} />
          </div>
        )}
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <textarea
            ref={setRefs}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask about tasks, agents..."
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {isStreaming ? (
            <Button
              size="icon"
              variant="destructive"
              className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0 rounded-xl"
              onClick={onStop}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0 rounded-xl"
              onClick={() => handleSend()}
              disabled={!value.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);