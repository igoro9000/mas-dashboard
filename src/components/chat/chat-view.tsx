"use client";

import { useEffect, useRef } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";

export function ChatView() {
  const { messages, isStreaming, send, stop, clear } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { keyboardHeight, isKeyboardOpen, isMobile } = useVirtualKeyboard();

  // Hide message list on mobile while keyboard is open — keeps only input visible
  const hideMessages = isMobile && isKeyboardOpen;

  // Scroll to bottom when messages change, streaming state changes, or messages become visible again
  useEffect(() => {
    if (!hideMessages) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, hideMessages]);

  const handleSend = async (content: string) => {
    await send(content);
  };

  const isEmpty = messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  const isLastMessageFromAssistant = lastMessage?.role === "assistant";

  return (
    <div
      className="fixed inset-x-0 flex flex-col bg-background overflow-x-hidden"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 3rem)", // safe-area + header h-12
        bottom: isKeyboardOpen
          ? `${keyboardHeight}px` // mobile: sit directly above keyboard
          : "calc(env(safe-area-inset-bottom, 0px) + 3.5rem)", // normal: above bottom nav (h-14)
      }}
    >
      {/* Clear button — hidden when keyboard is open */}
      {messages.length > 0 && !hideMessages && (
        <div className="flex justify-end px-3 py-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={clear}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Messages — hidden on mobile while keyboard is open */}
      {!hideMessages && (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-muted-foreground gap-3 px-8 text-center">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-sm">
                Chat with Claude about your MAS tasks and agents. Try &quot;What tasks do I
                have?&quot; or &quot;How are the agents doing?&quot;
              </p>
            </div>
          ) : (
            <div className="py-2">
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={isStreaming && msg.id === lastMessage?.id}
                />
              ))}

              {/* Typing indicator: show when streaming and last message is not yet from assistant */}
              {isStreaming && !isLastMessageFromAssistant && (
                <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
                  <span className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                  <span className="text-xs">Claude is thinking…</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}

      {/* Input — fills all space when keyboard is open, fixed size otherwise */}
      <div className={hideMessages ? "flex-1 flex flex-col min-h-0" : "shrink-0"}>
        <ChatInput
          ref={inputRef}
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
          isKeyboardOpen={hideMessages}
        />
      </div>
    </div>
  );
}
