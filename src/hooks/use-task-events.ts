import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";
import { useEventStore } from "@/stores/event-store";
import type { AgentEvent } from "@/types/event";

export function useTaskEvents(taskId: string) {
  const { session } = useAuth();
  const events = useEventStore((s) => s.eventsByTask[taskId] ?? []);
  const addEvent = useEventStore((s) => s.addEvent);
  const setEvents = useEventStore((s) => s.setEvents);

  useEffect(() => {
    const token = session?.access_token;
    if (!token || !taskId) return;

    const socket = getSocket(token);

    socket.emit("subscribe", taskId);

    const handleTaskEvents = (initialEvents: AgentEvent[]) => {
      setEvents(taskId, initialEvents);
    };

    const handleNewEvent = (event: AgentEvent) => {
      if (event.task_id === taskId) {
        addEvent(event);
      }
    };

    socket.on(`task:${taskId}:events`, handleTaskEvents);
    socket.on(`task:${taskId}:event`, handleNewEvent);
    socket.on("event", handleNewEvent);

    return () => {
      socket.emit("unsubscribe", taskId);
      socket.off(`task:${taskId}:events`, handleTaskEvents);
      socket.off(`task:${taskId}:event`, handleNewEvent);
      socket.off("event", handleNewEvent);
    };
  }, [taskId, session?.access_token, addEvent, setEvents]);

  return events as AgentEvent[];
}