import { supabase } from "./supabase";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function apiGet<T>(path: string) {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown) {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function apiDelete(path: string) {
  return apiFetch<void>(path, { method: "DELETE" });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  agent_id?: string;
  created_at: string;
  updated_at: string;
  branch_name?: string;
  pull_request_url?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  agent_id?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: string;
  agent_id?: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  task_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface SendChatMessagePayload {
  content: string;
  role?: "user" | "assistant" | "system";
}

export interface Event {
  id: string;
  task_id?: string;
  agent_id?: string;
  type: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

export interface MergeBranchResult {
  merged: boolean;
  message: string;
  pull_request_url?: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function getTasks(): Promise<Task[]> {
  return apiGet<Task[]>("/tasks");
}

export function getTask(taskId: string): Promise<Task> {
  return apiGet<Task>(`/tasks/${taskId}`);
}

export function createTask(payload: CreateTaskPayload): Promise<Task> {
  return apiPost<Task>("/tasks", payload);
}

export function updateTask(
  taskId: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  return apiPatch<Task>(`/tasks/${taskId}`, payload);
}

export function deleteTask(taskId: string): Promise<void> {
  return apiDelete(`/tasks/${taskId}`);
}

export function mergeBranch(
  taskId: string,
  branchName: string
): Promise<MergeBranchResult> {
  return apiPost<MergeBranchResult>(`/tasks/${taskId}/merge`, { branchName });
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export function getAgents(): Promise<Agent[]> {
  return apiGet<Agent[]>("/agents");
}

export function getAgent(agentId: string): Promise<Agent> {
  return apiGet<Agent>(`/agents/${agentId}`);
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export function getChatMessages(taskId: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(`/tasks/${taskId}/messages`);
}

export function sendChatMessage(
  taskId: string,
  payload: SendChatMessagePayload
): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`/tasks/${taskId}/messages`, payload);
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function getEvents(filters?: {
  task_id?: string;
  agent_id?: string;
  type?: string;
}): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters?.task_id) params.set("task_id", filters.task_id);
  if (filters?.agent_id) params.set("agent_id", filters.agent_id);
  if (filters?.type) params.set("type", filters.type);
  const query = params.toString();
  return apiGet<Event[]>(`/events${query ? `?${query}` : ""}`);
}