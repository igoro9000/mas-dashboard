"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useTask } from "@/hooks/use-task";
import { useTaskEvents } from "@/hooks/use-task-events";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPlanView } from "@/components/tasks/task-plan-view";
import { EventFeed } from "@/components/events/event-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitBranch, GitPullRequest, MessageSquare } from "lucide-react";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AuthGuard>
      <TaskDetail id={id} />
    </AuthGuard>
  );
}

function TaskDetail({ id }: { id: string }) {
  const { task, isLoading } = useTask(id);
  const events = useTaskEvents(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!task) {
    return <p className="py-8 text-center text-sm text-destructive">Task not found</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header: status + short id + chat link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TaskStatusBadge status={task.status} />
          <span className="text-xs text-muted-foreground font-mono">{task.id.slice(0, 8)}</span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/chat/${task.id}`}>
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Open Chat
          </Link>
        </Button>
      </div>

      {/* Info card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{task.repoFullName}</span>
          </div>

          {task.issueBody && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.issueBody}</p>
          )}

          {task.branchName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" />
              <code className="bg-muted px-1 py-0.5 rounded">{task.branchName}</code>
            </div>
          )}

          {task.prNumber && (
            <a
              href={`https://github.com/${task.repoFullName}/pull/${task.prNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <GitPullRequest className="h-4 w-4" />
              PR #{task.prNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>

      {/* Plan */}
      {task.plannerOutput && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">Execution Plan</h2>
            <TaskPlanView plan={task.plannerOutput} />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Live events */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Agent Activity</h2>
        <EventFeed events={events} />
      </div>
    </div>
  );
}