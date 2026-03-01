"use client";

import type { AgentEvent, AgentName } from "@/types/event";
import { relativeTime, cn } from "@/lib/utils";
import { Bot, Code, Search } from "lucide-react";

const agentConfig: Record<AgentName, { icon: typeof Bot; color: string }> = {
  planner: { icon: Bot, color: "text-blue-500" },
  coder: { icon: Code, color: "text-violet-500" },
  reviewer: { icon: Search, color: "text-amber-500" },
};

export function EventItem({ event }: { event: AgentEvent }) {
  const { icon: Icon, color } = agentConfig[event.agent];

  return (
    <div className="flex gap-3 py-2">
      <div className={cn("mt-0.5 shrink-0 rounded-full bg-muted p-1.5", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold capitalize", color)}>
            {event.agent}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {relativeTime(event.timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 break-words">{event.message}</p>
      </div>
    </div>
  );
}