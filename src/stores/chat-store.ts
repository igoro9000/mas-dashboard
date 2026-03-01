import { create } from "zustand";
import type { ChatMessage, ToolCall } from "@/types/chat";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  appendToMessage: (id: string, delta: string) => void;
  addToolCall: (id: string, tool: ToolCall) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setIsStreaming: (v: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((s) => {
      const exists = s.messages.some((m) => m.id === message.id);
      return exists ? s : { messages: [...s.messages, message] };
    }),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  appendToMessage: (id, delta) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + delta } : m
      ),
    })),
  addToolCall: (id, tool) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, toolCalls: [...(m.toolCalls ?? []), tool] } : m
      ),
    })),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  clearMessages: () => set({ messages: [] }),
  setIsStreaming: (v) => set({ isStreaming: v }),
}));
