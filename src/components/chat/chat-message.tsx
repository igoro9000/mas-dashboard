"use client";

import { useState, useCallback } from "react";
import { Wrench, Clipboard, Check } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { ToolCallCard } from "@/components/chat/tool-call-card";
import { TypingCursor } from "@/components/chat/typing-cursor";

interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function ChatMessageBubble({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const isEmpty = !message.content;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed silently
    }
  }, [message.content]);

  const timestamp = message.timestamp ? new Date(message.timestamp) : null;

  return (
    <div className={cn("flex flex-col px-3 py-2 w-full", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex flex-col gap-1", isUser ? "max-w-[85%] items-end" : "w-full items-start")}>
        {/* Tool call cards rendered above the bubble for assistant messages */}
        {!isUser && hasToolCalls && (
          <div className="flex w-full flex-col gap-1.5">
            {message.toolCalls!.map((tool) => (
              <ToolCallCard
                key={tool.id}
                toolName={tool.name}
                status={tool.status}
                result={
                  typeof tool.result === "string"
                    ? tool.result
                    : tool.result !== undefined
                    ? JSON.stringify(tool.result)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        <div className={cn("group relative", !isUser && "w-full")}>
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted rounded-bl-md"
            )}
          >
            {/* Spinner shown when tool calls are in progress but no content yet */}
            {!isUser && hasToolCalls && isEmpty && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wrench className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs">
                  Using {message.toolCalls![message.toolCalls!.length - 1].name}…
                </span>
              </div>
            )}

            {/* Message content */}
            {message.content && (
              <>
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
                {!isUser && isStreaming && <TypingCursor />}
              </>
            )}

            {/* Bouncing dots when streaming with no content and no tool calls */}
            {!isUser && isEmpty && !hasToolCalls && isStreaming && (
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* Copy button for assistant messages with content */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy message"}
              className={cn(
                "absolute top-1 right-1",
                "flex h-7 w-7 items-center justify-center",
                "rounded-md text-muted-foreground/50 transition-colors",
                "opacity-0 group-hover:opacity-100 focus:opacity-100",
                "hover:text-muted-foreground"
              )}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <time
            dateTime={timestamp.toISOString()}
            title={format(timestamp, "PPpp")}
            className="px-1 text-[10px] text-muted-foreground/60"
          >
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </time>
        )}
      </div>
    </div>
  );
}