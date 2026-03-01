import type { AgentName } from "./event";

export interface AgentStatus {
  name: AgentName;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
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