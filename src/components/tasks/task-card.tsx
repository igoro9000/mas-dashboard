"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge } from "./task-status-badge";
import { relativeTime } from "@/lib/utils";
import type { Task } from "@/types/task";
import { GitBranch } from "lucide-react";

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="active:scale-[0.98] transition-transform">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium truncate">
              <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {task.repoFullName}
            </span>
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.issueBody}
          </p>
          <p className="text-xs text-muted-foreground">{relativeTime(task.createdAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
