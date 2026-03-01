import useSWR from "swr";
import { useEffect } from "react";
import { apiGet } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";
import type { Task } from "@/types/task";

export function useTask(id: string) {
  const { session } = useAuth();

  const swr = useSWR<Task>(
    id ? `task-${id}` : null,
    () => apiGet<Task>(`/tasks/${id}`),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    const token = session?.access_token;
    if (!id || !token) return;

    const socket = getSocket(token);

    const handleTaskUpdate = () => {
      swr.mutate();
    };

    socket.on("task:update", handleTaskUpdate);

    return () => {
      socket.off("task:update", handleTaskUpdate);
    };
  }, [id, session?.access_token, swr.mutate]);

  return {
    task: swr.data,
    isLoading: !swr.error && !swr.data,
    isError: !!swr.error,
    error: swr.error,
    mutate: swr.mutate,
  };
}
