"use client";

import { useState, useCallback } from "react";
import { User, Bot, Wrench, Clipboard, Check } from "lucide-react";
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
    <div className={cn("flex gap-2 px-3 py-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {/* Tool call cards rendered above the bubble for AI messages */}
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

        <div className="group relative">
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted rounded-bl-md"
            )}
          >
            {hasToolCalls && isEmpty && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wrench className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs">
                  Using {message.toolCalls![message.toolCalls!.length - 1].name}...
                </span>
              </div>
            )}

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

            {!isUser && isEmpty && !hasToolCalls && isStreaming && (
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* Copy button for AI messages */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy message"}
              className={cn(
                "absolute -right-11 top-1/2 -translate-y-1/2",
                "flex min-h-[44px] min-w-[44px] items-center justify-center",
                "rounded-lg text-muted-foreground transition-colors",
                "opacity-0 group-hover:opacity-100 focus:opacity-100",
                "hover:bg-muted hover:text-foreground",
              )}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
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