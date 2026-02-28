"use client";

import { useRef, useEffect } from "react";
import type { AgentEvent } from "@/types/event";
import { EventItem } from "./event-item";

export function EventFeed({ events }: { events: AgentEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

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
    <div className="space-y-1 divide-y">
      {events.map((event, i) => (
        <EventItem key={`${event.timestamp}-${i}`} event={event} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
