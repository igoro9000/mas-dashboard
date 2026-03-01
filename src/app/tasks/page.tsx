"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { useTasks } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  return (
    <AuthGuard>
      <TaskList />
    </AuthGuard>
  );
}

function TaskList() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">Failed to load tasks</p>;
  }

  if (!tasks?.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No tasks yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}