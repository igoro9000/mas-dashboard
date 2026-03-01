"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AgentStatus } from "@/types/agent";
import type { AgentName } from "@/types/event";
import { cn } from "@/lib/utils";
import { Bot, Code, Search, GitMerge, CheckCircle2, XCircle, Zap } from "lucide-react";

const agentConfig: Record<
  AgentName,
  {
    icon: typeof Bot;
    color: string;
    bg: string;
    description: string;
    capabilities: string[];
  }
> = {
  planner: {
    icon: Bot,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Analyzes requirements and creates structured execution plans.",
    capabilities: ["Task decomposition", "Priority scheduling", "Dependency mapping"],
  },
  coder: {
    icon: Code,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    description: "Writes, refactors, and debugs code based on the plan.",
    capabilities: ["Code generation", "Refactoring", "Bug fixing", "Test writing"],
  },
  reviewer: {
    icon: Search,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    description: "Reviews code quality, correctness, and prepares merges.",
    capabilities: ["Code review", "Quality checks", "Merge management"],
  },
};

type StatusIndicator = "online" | "busy" | "offline";

function getStatusIndicator(agent: AgentStatus): StatusIndicator {
  if (agent.active > 0) return "busy";
  if (agent.waiting > 0) return "online";
  return "offline";
}

const statusConfig: Record<
  StatusIndicator,
  { label: string; dot: string; text: string }
> = {
  online: {
    label: "online",
    dot: "bg-green-500",
    text: "text-green-500",
  },
  busy: {
    label: "busy",
    dot: "bg-blue-500 animate-pulse",
    text: "text-blue-500",
  },
  offline: {
    label: "offline",
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  },
};

export function AgentCard({
  agent,
  onMerge,
}: {
  agent: AgentStatus;
  onMerge?: () => void;
}) {
  const { icon: Icon, color, bg, description, capabilities } =
    agentConfig[agent.name];

  const isActive = agent.active > 0;
  const isReviewer = agent.name === "reviewer";
  const hasMerged = isReviewer && agent.mergeStatus === "merged";
  const hasMergeFailed = isReviewer && agent.mergeStatus === "failed";
  const awaitingMerge =
    isReviewer &&
    agent.awaitingMerge === true &&
    !hasMerged &&
    !hasMergeFailed;

  const statusIndicator = getStatusIndicator(agent);
  const status = statusConfig[statusIndicator];

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isActive && "ring-1 ring-primary/30",
        awaitingMerge && "ring-1 ring-amber-500/50"
      )}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn("rounded-lg p-2 shrink-0", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold capitalize">{agent.name}</h3>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium shrink-0",
                  status.text
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                />
                {awaitingMerge ? "awaiting merge" : status.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {description}
            </p>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Zap className="h-3 w-3" />
            <span>Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {capabilities.map((cap) => (
              <Badge
                key={cap}
                variant="secondary"
                className="text-xs font-normal px-1.5 py-0"
              >
                {cap}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="Waiting" value={agent.waiting} />
          <Stat label="Active" value={agent.active} highlight={isActive} />
          <Stat label="Done" value={agent.completed} />
          <Stat label="Failed" value={agent.failed} danger={agent.failed > 0} />
        </div>

        {/* Reviewer actions */}
        {isReviewer && (
          <div className="pt-1 space-y-2">
            {awaitingMerge && (
              <Button
                size="sm"
                className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={onMerge}
              >
                <GitMerge className="h-4 w-4" />
                Merge Changes
              </Button>
            )}

            {hasMerged && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-medium">Merge successful</span>
              </div>
            )}

            {hasMergeFailed && (
              <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">Merge failed</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1.5",
        highlight
          ? "bg-primary/10"
          : danger
          ? "bg-red-500/10"
          : "bg-muted"
      )}
    >
      <p
        className={cn(
          "text-xs",
          highlight
            ? "text-primary/70"
            : danger
            ? "text-red-500/70"
            : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-base font-semibold",
          highlight ? "text-primary" : danger && value > 0 ? "text-red-500" : ""
        )}
      >
        {value}
      </p>
    </div>
  );
}