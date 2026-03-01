"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatView() {
  const { messages, isStreaming, send, stop, clear } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(0);
  const { keyboardHeight } = useVirtualKeyboard();

  // Scroll to bottom when messages change or streaming state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Track input container height for padding
  useEffect(() => {
    if (!inputContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInputHeight(entry.contentRect.height);
      }
    });
    observer.observe(inputContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // On iOS, when input is focused scroll message list to bottom and input into view
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        // Small delay to let the keyboard animate up
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Scroll to bottom when keyboard height changes (virtual keyboard open/close)
  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [keyboardHeight]);

  const handleSend = async (content: string) => {
    await send(content);
  };

  const isEmpty = messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  const isLastMessageFromAssistant = lastMessage?.role === "assistant";

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
      }}
    >
      {/* Clear button */}
      {messages.length > 0 && (
        <div className="flex justify-end px-3 py-1">
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

      {/* Messages */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 scroll-touch"
        style={{
          overscrollBehavior: "contain",
          paddingBottom: inputHeight,
        } as React.CSSProperties}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-3 px-8 text-center">
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
      </ScrollArea>

      {/* Input */}
      <div ref={inputContainerRef}>
        <ChatInput
          ref={inputRef}
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
          isEmpty={isEmpty}
        />
      </div>
    </div>
  );
}