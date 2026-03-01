import useSWR from "swr";
import { useEffect } from "react";
import { apiGet } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Task } from "@/types/task";

export function useTask(id: string) {
  const swr = useSWR<Task>(
    id ? `task-${id}` : null,
    () => apiGet<Task>(`/tasks/${id}`),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    if (!id) return;

    const socket = getSocket();

    const handleTaskUpdate = (updatedTask: Task) => {
      if (updatedTask.id === id) {
        swr.mutate(updatedTask, false);
      }
    };

    socket.on("task:updated", handleTaskUpdate);
    socket.on("task:deleted", (deletedId: string) => {
      if (deletedId === id) {
        swr.mutate(undefined, false);
      }
    });

    return () => {
      socket.off("task:updated", handleTaskUpdate);
    };
  }, [id, swr.mutate]);

  return {
    task: swr.data,
    isLoading: !swr.error && !swr.data,
    isError: !!swr.error,
    error: swr.error,
    mutate: swr.mutate,
  };
}