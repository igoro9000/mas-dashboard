"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge } from "./task-status-badge";
import { relativeTime } from "@/lib/utils";
import type { Task } from "@/types/task";
import { GitBranch, Bot } from "lucide-react";

export function TaskCard({ task }: { task: Task }) {
  const descriptionPreview = task.issueBody
    ? task.issueBody.replace(/[#*`_~\[\]]/g, "").trim()
    : null;

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="active:scale-[0.98] transition-transform hover:shadow-md hover:border-foreground/20">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-semibold truncate leading-tight">
                {task.title ?? `Task #${task.id.slice(0, 8)}`}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <GitBranch className="h-3 w-3 shrink-0" />
                {task.repoFullName}
              </span>
            </div>
            <TaskStatusBadge status={task.status} />
          </div>

          {descriptionPreview && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
              {descriptionPreview}
            </p>
          )}

          <div className="flex items-center justify-between pt-0.5">
            {task.agentId ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bot className="h-3 w-3 shrink-0" />
                {task.agentId.slice(0, 8)}
              </span>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground">
              {relativeTime(task.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}