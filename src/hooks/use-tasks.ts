import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Task } from "@/types/task";

export interface UseTasksOptions {
  page?: number;
  pageSize?: number;
  status?: string;
  assigneeId?: string;
  projectId?: string;
  search?: string;
}

export interface UseTasksResult {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  mutate: () => void;
}

interface TasksApiResponse {
  data: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildCacheKey(options: UseTasksOptions): string {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.pageSize !== undefined) params.set("pageSize", String(options.pageSize));
  if (options.status) params.set("status", options.status);
  if (options.assigneeId) params.set("assigneeId", options.assigneeId);
  if (options.projectId) params.set("projectId", options.projectId);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();
  return qs ? `tasks?${qs}` : "tasks";
}

function buildApiPath(options: UseTasksOptions): string {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.pageSize !== undefined) params.set("pageSize", String(options.pageSize));
  if (options.status) params.set("status", options.status);
  if (options.assigneeId) params.set("assigneeId", options.assigneeId);
  if (options.projectId) params.set("projectId", options.projectId);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}

async function fetchTasks(options: UseTasksOptions): Promise<TasksApiResponse> {
  const path = buildApiPath(options);
  const response = await apiGet<TasksApiResponse | Task[]>(path);

  // Handle APIs that return a plain array (no pagination envelope)
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? response.length,
      totalPages: 1,
    };
  }

  return response;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksResult {
  const {
    page = 1,
    pageSize = 20,
    status,
    assigneeId,
    projectId,
    search,
  } = options;

  const resolvedOptions: UseTasksOptions = {
    page,
    pageSize,
    status,
    assigneeId,
    projectId,
    search,
  };

  const cacheKey = buildCacheKey(resolvedOptions);

  const { data, error, isLoading, isValidating, mutate } = useSWR<TasksApiResponse>(
    cacheKey,
    () => fetchTasks(resolvedOptions),
    {
      refreshInterval: 15_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    try {
      socket = getSocket();
    } catch {
      // Socket not available in this environment; skip subscription
      return;
    }

    const handleTaskCreated = () => {
      mutateRef.current();
    };

    const handleTaskUpdated = () => {
      mutateRef.current();
    };

    const handleTaskDeleted = () => {
      mutateRef.current();
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);

    return () => {
      socket?.off("task:created", handleTaskCreated);
      socket?.off("task:updated", handleTaskUpdated);
      socket?.off("task:deleted", handleTaskDeleted);
    };
  }, []);

  return {
    tasks: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isValidating,
    error: error as Error | undefined,
    mutate,
  };
}