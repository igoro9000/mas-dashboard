"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import type { Task } from "@/types/task";

const REPO_RE = /^[^/]+\/[^/]+$/;

export function CreateTaskForm() {
  const router = useRouter();
  const [repo, setRepo] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = REPO_RE.test(repo.trim()) && body.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      const task = await apiPost<Task>("/tasks", {
        repoFullName: repo.trim(),
        issueBody: body.trim(),
      });
      router.push(`/tasks/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Repository</label>
        <Input
          placeholder="owner/repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="h-12 text-base"
        />
        {repo && !REPO_RE.test(repo.trim()) && (
          <p className="text-xs text-destructive">Format: owner/repo</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Task Description</label>
        <Textarea
          placeholder="Describe what you want the agents to do..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="text-base"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={!valid || loading} className="w-full h-12 text-base">
        {loading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
