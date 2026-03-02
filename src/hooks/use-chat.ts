"use client";

import { useRef, useCallback, useEffect } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import { apiGet, apiPost } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export function useChat() {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messages = useChatStore((s) =>
    activeSessionId ? (s.messages[activeSessionId] ?? []) : []
  );
  const isStreaming = useChatStore((s) => s.isStreaming);
  const abortRef = useRef<AbortController | null>(null);

  // ---------- helpers ----------

  const getToken = useCallback(async (): Promise<string | undefined> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }, []);

  // ---------- sessions ----------

  const fetchMessages = useCallback(async (sessionId?: string) => {
    const id = sessionId ?? useChatStore.getState().activeSessionId;
    if (!id) return;
    try {
      const data = await apiGet<ChatMessage[]>(`/chat/sessions/${id}/messages`);
      useChatStore.getState().setMessages(id, data);
    } catch {
      // silently ignore
    }
  }, []);

  const initSessions = useCallback(async () => {
    try {
      const sessions = await apiGet<ChatSession[]>("/chat/sessions");
      useChatStore.getState().setSessions(sessions);

      const currentActiveId = useChatStore.getState().activeSessionId;
      const validActive = sessions.find((s) => s.id === currentActiveId);

      if (validActive) {
        // Active session still exists — load messages if not already cached
        if ((useChatStore.getState().messages[validActive.id]?.length ?? 0) === 0) {
          await fetchMessages(validActive.id);
        }
      } else if (sessions.length > 0) {
        // Switch to most recent session
        const first = sessions[0];
        useChatStore.getState().setActiveSessionId(first.id);
        await fetchMessages(first.id);
      } else {
        // No sessions → create one
        const newSession = await apiPost<ChatSession>("/chat/sessions", { title: "New Chat" });
        useChatStore.getState().addSession(newSession);
        useChatStore.getState().setActiveSessionId(newSession.id);
      }
    } catch {
      // silently ignore
    }
  }, [fetchMessages]);

  const newSession = useCallback(async () => {
    try {
      const session = await apiPost<ChatSession>("/chat/sessions", { title: "New Chat" });
      useChatStore.getState().addSession(session);
      useChatStore.getState().setActiveSessionId(session.id);
      useChatStore.getState().setMessages(session.id, []);
    } catch {
      // silently ignore
    }
  }, []);

  const switchSession = useCallback(async (sessionId: string) => {
    useChatStore.getState().setActiveSessionId(sessionId);
    if ((useChatStore.getState().messages[sessionId]?.length ?? 0) === 0) {
      await fetchMessages(sessionId);
    }
  }, [fetchMessages]);

  // On mount: init sessions
  useEffect(() => {
    initSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- send ----------

  const send = useCallback(
    async (text: string) => {
      const sessionId = useChatStore.getState().activeSessionId;
      if (!sessionId) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        toolCalls: [],
        timestamp: Date.now(),
      };

      const assistantId = assistantMsg.id;

      // Build history (existing messages + new user message)
      const history = [
        ...(useChatStore.getState().messages[sessionId] ?? []),
        userMsg,
      ].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      useChatStore.getState().addMessage(sessionId, userMsg);
      useChatStore.getState().addMessage(sessionId, assistantMsg);
      useChatStore.getState().setIsStreaming(true);

      const token = await getToken();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch(`${BASE}/chat/sessions/${sessionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });

        if (!res.ok) {
          const body = await res.text();
          useChatStore.getState().updateMessage(sessionId, assistantId, {
            content: `Error: ${res.status} — ${body}`,
          });
          useChatStore.getState().setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          useChatStore.getState().setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split by double newlines to get complete SSE event blocks.
          // This ensures event-type and data are always parsed together,
          // even if a network chunk boundary falls between them.
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            if (!block.trim()) continue;

            let eventType = "";
            let dataStr = "";

            for (const line of block.split("\n")) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                dataStr = line.slice(6);
              }
            }

            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr) as Record<string, unknown>;
              if (eventType === "delta" && typeof data.text === "string") {
                useChatStore.getState().appendToMessage(sessionId, assistantId, data.text);
              } else if (eventType === "tool_use" && data.tool) {
                useChatStore.getState().addToolCall(sessionId, assistantId, data.tool as never);
              } else if (eventType === "message_id" && typeof data.id === "string") {
                useChatStore.getState().updateMessage(sessionId, assistantId, { id: data.id });
              } else if (eventType === "error") {
                const current = (useChatStore.getState().messages[sessionId] ?? []).find(
                  (m) => m.id === assistantId,
                );
                useChatStore.getState().updateMessage(sessionId, assistantId, {
                  content:
                    (current?.content ?? "") +
                    `\n\nError: ${(data.error as string | undefined) ?? "unknown"}`,
                });
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          useChatStore.getState().updateMessage(sessionId, assistantId, {
            content: `Error: ${(err as Error).message}`,
          });
        }
      } finally {
        useChatStore.getState().setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [getToken]
  );

  // ---------- stop ----------

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ---------- clear (local only — messages reload from DB on next session switch) ----------

  const clear = useCallback(() => {
    abortRef.current?.abort();
    const sessionId = useChatStore.getState().activeSessionId;
    if (sessionId) useChatStore.getState().clearMessages(sessionId);
    useChatStore.getState().setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    send,
    stop,
    clear,
    fetchMessages,
    newSession,
    switchSession,
    activeSessionId,
  };
}
