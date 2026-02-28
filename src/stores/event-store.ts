import { create } from "zustand";
import type { AgentEvent } from "@/types/event";

const MAX_EVENTS_PER_TASK = 500;

interface EventStore {
  eventsByTask: Record<string, AgentEvent[]>;
  addEvent: (event: AgentEvent) => void;
  clearTask: (taskId: string) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  eventsByTask: {},
  addEvent: (event) =>
    set((state) => {
      const existing = state.eventsByTask[event.taskId] ?? [];
      const updated = [...existing, event].slice(-MAX_EVENTS_PER_TASK);
      return { eventsByTask: { ...state.eventsByTask, [event.taskId]: updated } };
    }),
  clearTask: (taskId) =>
    set((state) => {
      const { [taskId]: _, ...rest } = state.eventsByTask;
      return { eventsByTask: rest };
    }),
}));
