export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: "pending" | "complete";
  result?: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  createdAt?: string;
  taskId?: string;
  agentId?: string;
  timestamp?: number;
  timestampISO?: string;
  isStreaming?: boolean;
}