import useSWR from "swr";
import { useEffect } from "react";
import { apiGet } from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import type { AgentStatus } from "@/types/agent";

const MERGE_ACTION_STATES = ["merging", "merged", "merge_failed"] as const;

export type MergeActionState = (typeof MERGE_ACTION_STATES)[number];

export function isMergeActionState(state: string): state is MergeActionState {
  return MERGE_ACTION_STATES.includes(state as MergeActionState);
}

export function useAgentStatus() {
  const { socket } = useSocket();

  const swr = useSWR<AgentStatus[]>(
    "agent-status",
    () => apiGet<AgentStatus[]>("/agents/status"),
    {
      refreshInterval: (data) => {
        if (!data) return 10_000;

        const hasMergeInProgress = data.some(
          (agent) =>
            agent.agentType === "review" &&
            agent.actionState != null &&
            agent.actionState === "merging",
        );

        return hasMergeInProgress ? 3_000 : 10_000;
      },
    },
  );

  useEffect(() => {
    if (!socket) return;

    const handleAgentStatusUpdate = (updatedStatuses: AgentStatus[]) => {
      swr.mutate(updatedStatuses, false);
    };

    socket.on("agent-status", handleAgentStatusUpdate);

    return () => {
      socket.off("agent-status", handleAgentStatusUpdate);
    };
  }, [socket, swr.mutate]);

  const reviewAgent = swr.data?.find((agent) => agent.agentType === "review");

  const mergeActionState: MergeActionState | null =
    reviewAgent?.actionState != null &&
    isMergeActionState(reviewAgent.actionState)
      ? (reviewAgent.actionState as MergeActionState)
      : null;

  return {
    ...swr,
    mergeActionState,
    isMerging: mergeActionState === "merging",
    isMerged: mergeActionState === "merged",
    isMergeFailed: mergeActionState === "merge_failed",
  };
}