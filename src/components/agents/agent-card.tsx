"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { AgentStatus } from "@/types/agent";
import type { AgentName } from "@/types/event";
import { cn } from "@/lib/utils";
import { Bot, Code, Search, Bug } from "lucide-react";

const agentConfig: Record<AgentName, { icon: typeof Bot; color: string; bg: string }> = {
  planner: { icon: Bot, color: "text-blue-500", bg: "bg-blue-500/10" },
  coder: { icon: Code, color: "text-violet-500", bg: "bg-violet-500/10" },
  reviewer: { icon: Search, color: "text-amber-500", bg: "bg-amber-500/10" },
  debugger: { icon: Bug, color: "text-orange-500", bg: "bg-orange-500/10" },
};

export function AgentCard({ agent }: { agent: AgentStatus }) {
  const { icon: Icon, color, bg } = agentConfig[agent.name];
  const isActive = agent.active > 0;

  return (
    <Card className={cn(isActive && "ring-1 ring-primary/30")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn("rounded-lg p-2", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold capitalize">{agent.name}</h3>
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                active
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="Waiting" value={agent.waiting} />
          <Stat label="Active" value={agent.active} />
          <Stat label="Done" value={agent.completed} />
          <Stat label="Failed" value={agent.failed} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted px-2 py-1.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
