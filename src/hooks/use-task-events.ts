import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";
import { useEventStore } from "@/stores/event-store";
import type { AgentEvent } from "@/types/event";

export function useTaskEvents(taskId: string) {
  const { session } = useAuth();
  const events = useEventStore((s) => s.eventsByTask[taskId] ?? []);

  useEffect(() => {
    const token = session?.access_token;
    if (!token || !taskId) return;

    const socket = getSocket(token);
    socket.emit("task:subscribe", taskId);
    return () => {
      socket.emit("task:unsubscribe", taskId);
    };
  }, [taskId, session?.access_token]);

  return events as AgentEvent[];
}
