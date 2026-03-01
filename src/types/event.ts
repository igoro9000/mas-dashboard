export type AgentName = "planner" | "coder" | "reviewer";

export type AgentEventType =
  | "agent:started"
  | "agent:progress"
  | "agent:completed"
  | "agent:failed"
  | "task:status_changed";

export interface AgentEvent {
  taskId: string;
  agent: AgentName;
  type: AgentEventType;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}
