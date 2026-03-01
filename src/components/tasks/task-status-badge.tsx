"use client";

import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  pending: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
  cancelled: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  planning: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  coding: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  reviewing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  debugging: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  done: "bg-green-500/15 text-green-600 dark:text-green-400",
  escalated: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const defaultVariant = "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const variantClass = variants[status as string] ?? defaultVariant;

  return (
    <Badge variant="secondary" className={cn("text-xs font-medium", variantClass)}>
      {status}
    </Badge>
  );
}