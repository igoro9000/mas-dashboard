import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Task } from "@/types/task";

export function useTasks() {
  return useSWR<Task[]>("tasks", () => apiGet<Task[]>("/tasks"), {
    refreshInterval: 15_000,
  });
}
