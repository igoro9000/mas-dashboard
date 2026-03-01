"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";
import { supabase } from "@/lib/supabase";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE_URL ?? BASE.replace(/^http/, "ws");

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ---------- helpers ----------

  const getToken = useCallback(async (): Promise<string | undefined> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }, []);

  // ---------- real-time socket ----------

  const connectSocket = useCallback(async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const token = await getToken();
    const url = token
      ? `${WS_BASE}/chat/events?token=${encodeURIComponent(token)}`
      : `${WS_BASE}/chat/events`;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const payload = JSON.parse(event.data as string) as {
          type: string;
          message?: ChatMessage;
          messageId?: string;
          content?: string;
        };

        switch (payload.type) {
          case "chat:new":
            if (payload.message) {
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === payload.message!.id);
                return exists ? prev : [...prev, payload.message!];
              });
            }
            break;

          case "chat:update":
            if (payload.messageId) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === payload.messageId
                    ? { ...m, content: payload.content ?? m.content }
                    : m
                )
              );
            }
            break;

          case "chat:delete":
            if (payload.messageId) {
              setMessages((prev) =>
                prev.filter((m) => m.id !== payload.messageId)
              );
            }
            break;

          default:
            break;
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      // Exponential back-off reconnect (cap at 30 s)
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connectSocket();
      }, 5_000);
    };
  }, [getToken]);

  useEffect(() => {
    mountedRef.current = true;
    connectSocket();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
    // connectSocket is stable (wrapped in useCallback with stable deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- fetch history ----------

  const fetchMessages = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE}/chat/messages`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return;
      const data: ChatMessage[] = await res.json();
      if (mountedRef.current) setMessages(data);
    } catch {
      // network errors are silently ignored; socket will keep state in sync
    }
  }, [getToken]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- send ----------

  const send = useCallback(
    async (text: string) => {
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

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const assistantId = assistantMsg.id;

      // Build history for API (only role + content)
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const token = await getToken();

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch(`${BASE}/chat`, {
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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Error: ${res.status} — ${body}` }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);
                if (eventType === "delta" && data.text) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + data.text }
                        : m
                    )
                  );
                } else if (eventType === "tool_use" && data.tool) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolCalls: [...(m.toolCalls ?? []), data.tool],
                          }
                        : m
                    )
                  );
                } else if (eventType === "message_id" && data.id) {
                  // Server may confirm the persisted IDs after streaming
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, id: data.id } : m
                    )
                  );
                } else if (eventType === "error") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            content:
                              m.content + `\n\nError: ${data.error ?? "unknown"}`,
                          }
                        : m
                    )
                  );
                }
              } catch {
                // ignore parse errors
              }
              eventType = "";
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Error: ${(err as Error).message}` }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, getToken]
  );

  // ---------- stop ----------

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ---------- clear ----------

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, send, stop, clear, fetchMessages };
}