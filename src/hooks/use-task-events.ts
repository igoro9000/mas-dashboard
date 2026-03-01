import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";
import { useEventStore } from "@/stores/event-store";
import type { AgentEvent } from "@/types/event";

export function useTaskEvents(taskId: string) {
  const { session } = useAuth();
  const events = useEventStore((s) => s.eventsByTask[taskId] ?? []);
  const addEvent = useEventStore((s) => s.addEvent);

  useEffect(() => {
    const token = session?.access_token;
    if (!token || !taskId) return;

    const socket = getSocket(token);

    socket.emit("task:subscribe", taskId);

    const handleNewEvent = (event: AgentEvent) => {
      if (event.taskId === taskId) {
        addEvent(event);
      }
    };

    socket.on("agent:event", handleNewEvent);

    return () => {
      socket.emit("task:unsubscribe", taskId);
      socket.off("agent:event", handleNewEvent);
    };
  }, [taskId, session?.access_token, addEvent]);

  return events as AgentEvent[];
}
