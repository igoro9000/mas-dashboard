export type TaskStatus =
  | "pending"
  | "planning"
  | "coding"
  | "reviewing"
  | "done"
  | "failed"
  | "escalated";

export interface FileChange {
  path: string;
  action: "create" | "update" | "delete";
  description: string;
}

export interface PlannerOutput {
  summary: string;
  steps: string[];
  files: FileChange[];
  branchName: string;
}

export interface TaskPlan {
  summary: string;
  steps: string[];
  files: FileChange[];
  branchName: string;
}

export interface Task {
  id: string;
  title?: string;
  description?: string;
  status: TaskStatus;
  plan?: TaskPlan | null;
  agentId?: string | null;
  repoFullName: string;
  issueBody: string;
  plannerOutput: PlannerOutput | null;
  prNumber: number | null;
  branchName: string | null;
  fixAttempts: number;
  createdAt: string;
  updatedAt: string;
}