"use client";

import { useEffect, useRef } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatView() {
  const { messages, isStreaming, send, stop, clear } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)]">
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
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
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
                isStreaming={isStreaming && msg.id === messages[messages.length - 1]?.id}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={send} onStop={stop} isStreaming={isStreaming} />
    </div>
  );
}
