"use client";

import { useRef, useCallback, useEffect } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Stable empty array — prevents Zustand Object.is comparison from creating a
// new [] on every render, which would cause an infinite re-render loop.
const EMPTY_MESSAGES: ChatMessage[] = [];

export function useChat() {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messages = useChatStore((s) =>
    (activeSessionId ? s.messages[activeSessionId] : null) ?? EMPTY_MESSAGES
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
        if ((useChatStore.getState().messages[validActive.id]?.length ?? 0) === 0) {
          await fetchMessages(validActive.id);
        }
      } else if (sessions.length > 0) {
        const first = sessions[0];
        useChatStore.getState().setActiveSessionId(first.id);
        await fetchMessages(first.id);
      } else {
        // No sessions — create the first one
        const session = await apiPost<ChatSession>("/chat/sessions", { title: "New Chat" });
        useChatStore.getState().addSession(session);
        useChatStore.getState().setActiveSessionId(session.id);
        useChatStore.getState().setMessages(session.id, []);
      }
    } catch {
      // silently ignore
    }
  }, [fetchMessages]);

  /** Create a new session — blocked if current session has no messages yet. */
  const newSession = useCallback(async () => {
    const currentId = useChatStore.getState().activeSessionId;
    if (currentId) {
      const currentMsgs = useChatStore.getState().messages[currentId] ?? [];
      if (currentMsgs.length === 0) return; // don't open new chat while current is empty
    }
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

  const deleteSession = useCallback(async (sessionId: string) => {
    useChatStore.getState().removeSession(sessionId);
    try {
      await apiDelete(`/chat/sessions/${sessionId}`);
    } catch {
      // silently ignore
    }
  }, []);

  /** Delete every session and open a fresh empty one. */
  const deleteAllSessions = useCallback(async () => {
    const ids = useChatStore.getState().sessions.map((s) => s.id);
    useChatStore.getState().setSessions([]);
    useChatStore.getState().setActiveSessionId(null);
    ids.forEach((id) => apiDelete(`/chat/sessions/${id}`).catch(() => {}));
    try {
      const session = await apiPost<ChatSession>("/chat/sessions", { title: "New Chat" });
      useChatStore.getState().addSession(session);
      useChatStore.getState().setActiveSessionId(session.id);
      useChatStore.getState().setMessages(session.id, []);
    } catch {
      // silently ignore
    }
  }, []);

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

      const existingMessages = useChatStore.getState().messages[sessionId] ?? [];
      const isFirstMessage = existingMessages.length === 0;

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

      const history = [...existingMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      useChatStore.getState().addMessage(sessionId, userMsg);
      useChatStore.getState().addMessage(sessionId, assistantMsg);
      useChatStore.getState().setIsStreaming(true);

      // Use first message as session title
      if (isFirstMessage) {
        const title = text.length > 40 ? text.slice(0, 40).trimEnd() + "…" : text;
        useChatStore.getState().setSessions(
          useChatStore.getState().sessions.map((s) =>
            s.id === sessionId ? { ...s, title } : s
          )
        );
        apiPatch<void>(`/chat/sessions/${sessionId}`, { title }).catch(() => {});
      }

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
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            if (!block.trim()) continue;
            let eventType = "";
            let dataStr = "";
            for (const line of block.split("\n")) {
              if (line.startsWith("event: ")) eventType = line.slice(7).trim();
              else if (line.startsWith("data: ")) dataStr = line.slice(6);
            }
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr) as Record<string, unknown>;
              if (eventType === "delta" && typeof data.text === "string") {
                useChatStore.getState().appendToMessage(sessionId, assistantId, data.text);
              } else if (eventType === "tool_use" && typeof data.tool === "string") {
                useChatStore.getState().addToolCall(sessionId, assistantId, {
                  id: crypto.randomUUID(),
                  name: data.tool,
                  arguments: {},
                  status: "pending",
                });
              } else if (eventType === "message_id" && typeof data.id === "string") {
                useChatStore.getState().updateMessage(sessionId, assistantId, { id: data.id });
              } else if (eventType === "error") {
                const current = (useChatStore.getState().messages[sessionId] ?? []).find(
                  (m) => m.id === assistantId
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

  return {
    messages,
    isStreaming,
    send,
    stop,
    fetchMessages,
    newSession,
    switchSession,
    deleteSession,
    deleteAllSessions,
    activeSessionId,
  };
}
