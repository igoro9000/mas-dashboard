export type TaskStatus =
  | "pending"
  | "planning"
  | "coding"
  | "reviewing"
  | "debugging"
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

export interface Task {
  id: string;
  repoFullName: string;
  issueBody: string;
  status: TaskStatus;
  plannerOutput: PlannerOutput | null;
  prNumber: number | null;
  branchName: string | null;
  fixAttempts: number;
  createdAt: string;
  updatedAt: string;
}
