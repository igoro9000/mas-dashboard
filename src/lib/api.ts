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

export function apiDelete(path: string) {
  return apiFetch<void>(path, { method: "DELETE" });
}

export interface MergeBranchResult {
  merged: boolean;
  message: string;
  pull_request_url?: string;
}

export function mergeBranch(
  taskId: string,
  branchName: string
): Promise<MergeBranchResult> {
  return apiPost<MergeBranchResult>(`/tasks/${taskId}/merge`, { branchName });
}