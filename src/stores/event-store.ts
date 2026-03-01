import { create } from "zustand";
import type { AgentEvent } from "@/types/event";

const MAX_EVENTS_PER_TASK = 500;

interface EventStore {
  events: AgentEvent[];
  eventsByTask: Record<string, AgentEvent[]>;
  addEvent: (event: AgentEvent) => void;
  clearEvents: () => void;
  clearTask: (taskId: string) => void;
  filterByTask: (taskId: string) => AgentEvent[];
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  eventsByTask: {},

  addEvent: (event) =>
    set((state) => {
      const updatedEvents = [...state.events, event];
      const existing = state.eventsByTask[event.taskId] ?? [];
      const updatedForTask = [...existing, event].slice(-MAX_EVENTS_PER_TASK);
      return {
        events: updatedEvents,
        eventsByTask: {
          ...state.eventsByTask,
          [event.taskId]: updatedForTask,
        },
      };
    }),

  clearEvents: () =>
    set(() => ({
      events: [],
      eventsByTask: {},
    })),

  clearTask: (taskId) =>
    set((state) => {
      const taskEvents = state.eventsByTask[taskId] ?? [];
      const updatedEvents = state.events.filter(
        (e) => !taskEvents.includes(e)
      );
      const eventsByTask = { ...state.eventsByTask };
      delete eventsByTask[taskId];
      return { events: updatedEvents, eventsByTask };
    }),

  filterByTask: (taskId) => {
    const state = get();
    return state.eventsByTask[taskId] ?? [];
  },
}));