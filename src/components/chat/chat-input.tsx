"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isKeyboardOpen?: boolean;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput(
    { onSend, onStop, isStreaming, onFocus, onBlur, isKeyboardOpen = false },
    ref
  ) {
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
      el.style.height = `${el.scrollHeight}px`;
    };

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
      <div className={isKeyboardOpen
        ? "flex flex-col flex-1 min-h-0 border-t bg-background px-3 py-2"
        : "border-t bg-background px-3 py-2"
      }>
        <div className={isKeyboardOpen
          ? "flex gap-2 max-w-lg mx-auto flex-1 min-h-0 items-end"
          : "flex items-end gap-2 max-w-lg mx-auto"
        }>
          <textarea
            ref={setRefs}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={isKeyboardOpen ? undefined : handleInput}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Ask about tasks, agents..."
            rows={1}
            disabled={isStreaming}
            className={isKeyboardOpen
              ? "flex-1 min-h-0 overflow-y-auto resize-none rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              : "flex-1 max-h-[40vh] overflow-y-auto resize-none rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            }
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
              disabled={!value.trim() || isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);
