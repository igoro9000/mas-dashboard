"use client";

import { User, Bot, Wrench } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function ChatMessageBubble({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const isEmpty = !message.content;

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

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {hasToolCalls && isEmpty && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wrench className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs">
              Using {message.toolCalls![message.toolCalls!.length - 1]}...
            </span>
          </div>
        )}

        {message.content && (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}

        {!isUser && isEmpty && !hasToolCalls && isStreaming && (
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
          </div>
        )}

        {hasToolCalls && message.content && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.toolCalls!.map((tool, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                <Wrench className="h-2.5 w-2.5" />
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
