"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { useAgentStatus } from "@/hooks/use-agent-status";
import { AgentCard } from "@/components/agents/agent-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentsPage() {
  return (
    <AuthGuard>
      <AgentGrid />
    </AuthGuard>
  );
}

function AgentGrid() {
  const { data: agents, isLoading } = useAgentStatus();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!agents?.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No agent data</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {agents.map((agent) => (
        <AgentCard key={agent.name} agent={agent} />
      ))}
    </div>
  );
}
