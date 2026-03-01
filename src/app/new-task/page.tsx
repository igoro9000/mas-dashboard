"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/auth-guard";
import { CreateTaskForm } from "@/components/tasks/create-task-form";

export default function NewTaskPage() {
  const router = useRouter();

  const handleSuccess = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  return (
    <AuthGuard>
      <CreateTaskForm onSuccess={handleSuccess} />
    </AuthGuard>
  );
}