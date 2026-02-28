import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Task } from "@/types/task";

export function useTask(id: string) {
  return useSWR<Task>(`task-${id}`, () => apiGet<Task>(`/tasks/${id}`), {
    refreshInterval: 10_000,
  });
}
