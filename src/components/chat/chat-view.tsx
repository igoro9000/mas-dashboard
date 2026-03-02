"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Trash2, Plus, ChevronDown } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useChatStore, MAX_SESSIONS } from "@/stores/chat-store";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChatView() {
  const {
    messages,
    isStreaming,
    send,
    stop,
    newSession,
    switchSession,
    deleteSession,
    activeSessionId,
  } = useChat();
  const sessions = useChatStore((s) => s.sessions);
  const [showSessions, setShowSessions] = useState(false);
  const sessionsPanelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const wasStreamingRef = useRef(false);
  const { keyboardHeight, isKeyboardOpen, isMobile } = useVirtualKeyboard();

  // Hide message list on mobile while keyboard is open
  const hideMessages = isMobile && isKeyboardOpen;

  // Close sessions panel when clicking outside
  useEffect(() => {
    if (!showSessions) return;
    const handler = (e: MouseEvent) => {
      if (sessionsPanelRef.current && !sessionsPanelRef.current.contains(e.target as Node)) {
        setShowSessions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSessions]);

  // Scroll to bottom when messages change or streaming state changes
  useEffect(() => {
    if (!hideMessages) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, hideMessages]);

  // Focus the last assistant message as soon as streaming finishes
  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
      return;
    }
    if (!wasStreamingRef.current) return;
    wasStreamingRef.current = false;
    lastMessageRef.current?.focus();
  }, [isStreaming]);

  const isEmpty = messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  const isLastMessageFromAssistant = lastMessage?.role === "assistant";
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const canAddSession = sessions.length < MAX_SESSIONS;

  return (
    <div
      className="fixed inset-x-0 flex flex-col bg-background overflow-x-hidden"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 3rem)",
        bottom: isKeyboardOpen
          ? `${keyboardHeight}px`
          : "calc(env(safe-area-inset-bottom, 0px) + 3.5rem)",
      }}
    >
      {/* ── Session toolbar ─────────────────────────────────────── */}
      {!hideMessages && (
        <div className="flex items-center justify-between px-2 py-1 shrink-0 border-b border-border/40">

          {/* Left: "Alle Chats" button with dropdown */}
          <div className="relative" ref={sessionsPanelRef}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground gap-1 px-2"
              onClick={() => setShowSessions((v) => !v)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {sessions.length > 0
                  ? `${sessions.length} Chat${sessions.length !== 1 ? "s" : ""}`
                  : "Alle Chats"}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showSessions && "rotate-180")} />
            </Button>

            {/* Sessions dropdown panel */}
            {showSessions && (
              <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-md border border-border bg-popover shadow-md overflow-hidden">
                {sessions.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Keine Chats vorhanden</p>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors truncate",
                        session.id === activeSessionId && "bg-muted font-medium"
                      )}
                      onClick={() => {
                        switchSession(session.id);
                        setShowSessions(false);
                      }}
                    >
                      {session.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: New Chat button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground px-2"
            onClick={newSession}
            disabled={!canAddSession}
            title={canAddSession ? "Neuen Chat erstellen" : `Maximal ${MAX_SESSIONS} Chats`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────────── */}
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
              {/* Trash button — top of chat room, above the first message */}
              {activeSessionId && (
                <div className="flex justify-center pb-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => deleteSession(activeSessionId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Chat löschen
                  </Button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  ref={
                    idx === messages.length - 1 && msg.role === "assistant"
                      ? lastMessageRef
                      : undefined
                  }
                  tabIndex={-1}
                  className="outline-none"
                >
                  <ChatMessageBubble
                    message={msg}
                    isStreaming={isStreaming && msg.id === lastMessage?.id}
                  />
                </div>
              ))}

              {/* Typing indicator */}
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

      {/* ── Input ───────────────────────────────────────────────── */}
      <div className={hideMessages ? "flex-1 flex flex-col min-h-0" : "shrink-0"}>
        <ChatInput
          ref={inputRef}
          onSend={send}
          onStop={stop}
          isStreaming={isStreaming}
          isKeyboardOpen={hideMessages}
        />
      </div>
    </div>
  );
}
