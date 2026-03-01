export type AgentName = "planner" | "coder" | "reviewer";

export type AgentEventType =
  | "agent:started"
  | "agent:progress"
  | "agent:completed"
  | "agent:failed"
  | "task:status_changed";

export type EventType =
  | "agent:started"
  | "agent:progress"
  | "agent:completed"
  | "agent:failed"
  | "task:status_changed"
  | "task:created"
  | "task:updated"
  | "task:deleted"
  | "task:assigned"
  | "task:unassigned"
  | "system:info"
  | "system:warning"
  | "system:error";

export interface AgentEvent {
  taskId: string;
  agent: AgentName;
  type: AgentEventType;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface Event {
  id: string;
  type: EventType;
  taskId: string;
  agentId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}