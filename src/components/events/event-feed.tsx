"use client";

import { useRef, useEffect, useMemo } from "react";
import type { AgentEvent } from "@/types/event";
import { EventItem } from "./event-item";
import { useTaskEvents } from "@/hooks/use-task-events";

interface EventFeedProps {
  taskId?: string;
  events?: AgentEvent[];
}

export function EventFeed({ taskId, events: externalEvents }: EventFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { events: liveEvents } = useTaskEvents(taskId);

  const events = useMemo(() => {
    const base = externalEvents ?? liveEvents;
    return [...base].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [externalEvents, liveEvents]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No events yet. Waiting for agents...
      </p>
    );
  }

  return (
    <div className="relative flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 divide-y divide-border">
          {events.map((event, i) => (
            <EventItem key={`${event.timestamp}-${i}`} event={event} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}