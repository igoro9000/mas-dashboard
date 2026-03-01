import type { AgentName } from "./event";

export interface AgentStatus {
  name: AgentName;
  agentType?: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  mergeStatus?: "merged" | "failed";
  awaitingMerge?: boolean;
  actionState?: string | null;
}

export type AgentActionType =
  | "processTask"
  | "reviewCode"
  | "runTests"
  | "mergeBranch"
  | "createPullRequest"
  | "resolveConflicts";

export interface AgentMergeOptions {
  sourceBranch: string;
  targetBranch: string;
  deleteSourceBranchAfterMerge?: boolean;
  squashCommits?: boolean;
  commitMessage?: string;
}

export interface AgentCompletionConfig {
  mergeOnCompletion?: boolean;
  mergeOptions?: AgentMergeOptions;
  notifyOnMerge?: boolean;
  actionType?: AgentActionType;
}

export interface AgentConfig {
  name: AgentName;
  completionConfig?: AgentCompletionConfig;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface MergeBranchAction {
  type: "mergeBranch";
  agentName: AgentName;
  mergeOptions: AgentMergeOptions;
  timestamp: string;
}

export interface AgentActionResult {
  actionType: AgentActionType;
  success: boolean;
  message?: string;
  mergeResult?: {
    merged: boolean;
    sourceBranch: string;
    targetBranch: string;
    commitSha?: string;
    conflictsDetected?: boolean;
  };
}

export type AgentCapability =
  | "processTask"
  | "reviewCode"
  | "runTests"
  | "mergeBranch"
  | "createPullRequest"
  | "resolveConflicts"
  | "codeGeneration"
  | "debugging"
  | "documentation"
  | "deployment";

export type AgentActiveStatus =
  | "active"
  | "inactive"
  | "busy"
  | "error"
  | "idle";

export interface AgentMetadata {
  version?: string;
  author?: string;
  tags?: string[];
  model?: string;
  provider?: string;
  maxConcurrentTasks?: number;
  supportedLanguages?: string[];
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: AgentActiveStatus;
  capabilities: AgentCapability[];
  avatar?: string;
  avatarUrl?: string;
  agentType?: string;
  config?: AgentConfig;
  metadata?: AgentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  description?: string;
  status: AgentActiveStatus;
  capabilities: AgentCapability[];
  avatar?: string;
  avatarUrl?: string;
  agentType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCreateInput {
  name: string;
  description?: string;
  status?: AgentActiveStatus;
  capabilities?: AgentCapability[];
  avatar?: string;
  avatarUrl?: string;
  agentType?: string;
  config?: AgentConfig;
  metadata?: AgentMetadata;
}

export interface AgentUpdateInput {
  name?: string;
  description?: string;
  status?: AgentActiveStatus;
  capabilities?: AgentCapability[];
  avatar?: string;
  avatarUrl?: string;
  agentType?: string;
  config?: AgentConfig;
  metadata?: AgentMetadata;
}