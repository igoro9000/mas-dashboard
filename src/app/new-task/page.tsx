"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { CreateTaskForm } from "@/components/tasks/create-task-form";

export default function NewTaskPage() {
  return (
    <AuthGuard>
      <CreateTaskForm />
    </AuthGuard>
  );
}
