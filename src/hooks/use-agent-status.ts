import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { AgentStatus } from "@/types/agent";

export function useAgentStatus() {
  return useSWR<AgentStatus[]>("agent-status", () => apiGet<AgentStatus[]>("/agents/status"), {
    refreshInterval: 10_000,
  });
}
