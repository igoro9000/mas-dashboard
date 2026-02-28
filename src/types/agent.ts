import type { AgentName } from "./event";

export interface AgentStatus {
  name: AgentName;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}
