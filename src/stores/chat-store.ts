import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ChatSession, ToolCall } from "@/types/chat";

export const MAX_SESSIONS = 10;

interface ChatStore {
  // ── Sessions ──────────────────────────────────────────────────────────────
  sessions: ChatSession[];
  activeSessionId: string | null;

  // ── Messages (keyed by sessionId, in-memory cache) ────────────────────────
  messages: Record<string, ChatMessage[]>;

  // ── Streaming state ───────────────────────────────────────────────────────
  isStreaming: boolean;

  // ── Session actions ───────────────────────────────────────────────────────
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  removeSession: (id: string) => void;
  setActiveSessionId: (id: string | null) => void;

  // ── Message actions (scoped to a sessionId) ───────────────────────────────
  setMessages: (sessionId: string, messages: ChatMessage[]) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, id: string, patch: Partial<ChatMessage>) => void;
  appendToMessage: (sessionId: string, id: string, delta: string) => void;
  addToolCall: (sessionId: string, id: string, tool: ToolCall) => void;
  clearMessages: (sessionId: string) => void;

  // ── Streaming ─────────────────────────────────────────────────────────────
  setIsStreaming: (v: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      messages: {},
      isStreaming: false,

      // ── Session actions ──────────────────────────────────────────────────
      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((s) => ({
          sessions: [session, ...s.sessions].slice(0, MAX_SESSIONS),
        })),

      removeSession: (id) =>
        set((s) => {
          const sessions = s.sessions.filter((sess) => sess.id !== id);
          const messages = { ...s.messages };
          delete messages[id];

          // If we removed the active session, switch to the next available one
          const activeSessionId =
            s.activeSessionId === id
              ? (sessions[0]?.id ?? null)
              : s.activeSessionId;

          return { sessions, messages, activeSessionId };
        }),

      setActiveSessionId: (id) => set({ activeSessionId: id }),

      // ── Message actions ──────────────────────────────────────────────────
      setMessages: (sessionId, messages) =>
        set((s) => ({ messages: { ...s.messages, [sessionId]: messages } })),

      addMessage: (sessionId, message) =>
        set((s) => {
          const existing = s.messages[sessionId] ?? [];
          if (existing.some((m) => m.id === message.id)) return s;
          return {
            messages: { ...s.messages, [sessionId]: [...existing, message] },
          };
        }),

      updateMessage: (sessionId, id, patch) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [sessionId]: (s.messages[sessionId] ?? []).map((m) =>
              m.id === id ? { ...m, ...patch } : m
            ),
          },
        })),

      appendToMessage: (sessionId, id, delta) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [sessionId]: (s.messages[sessionId] ?? []).map((m) =>
              m.id === id ? { ...m, content: m.content + delta } : m
            ),
          },
        })),

      addToolCall: (sessionId, id, tool) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [sessionId]: (s.messages[sessionId] ?? []).map((m) =>
              m.id === id
                ? { ...m, toolCalls: [...(m.toolCalls ?? []), tool] }
                : m
            ),
          },
        })),

      clearMessages: (sessionId) =>
        set((s) => {
          const messages = { ...s.messages };
          delete messages[sessionId];
          return { messages };
        }),

      // ── Streaming ────────────────────────────────────────────────────────
      setIsStreaming: (v) => set({ isStreaming: v }),
    }),
    {
      name: "chat-store",
      // Only persist sessions + activeSessionId.
      // Messages are re-fetched from API on mount (DB is source of truth).
      // isStreaming is always false after a reload.
      partialize: (s) => ({
        sessions: s.sessions,
        activeSessionId: s.activeSessionId,
      }),
    }
  )
);
