"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, apiGet } from "@/lib/api";
import type { Task } from "@/types/task";

const REPO_RE = /^[^/]+\/[^/]+$/;

interface Agent {
  id: string;
  name: string;
  description?: string;
}

export function CreateTaskForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchAgents() {
      try {
        const data = await apiGet<Agent[]>("/agents");
        setAgents(data);
        if (data.length > 0) {
          setAgentId(data[0].id);
        }
      } catch {
        // agents are optional; silently ignore
      } finally {
        setLoadingAgents(false);
      }
    }
    fetchAgents();
  }, []);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (repo.trim() && !REPO_RE.test(repo.trim())) {
      errors.repo = "Format: owner/repo";
    }

    if (agents.length > 0 && !agentId) {
      errors.agentId = "Please select an agent";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const isFormDirty = title.trim().length > 0 || description.trim().length > 0;
  const canSubmit =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    (!repo.trim() || REPO_RE.test(repo.trim())) &&
    (agents.length === 0 || !!agentId) &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        title: title.trim(),
        description: description.trim(),
      };

      if (repo.trim()) {
        payload.repoFullName = repo.trim();
      }

      if (agentId) {
        payload.agentId = agentId;
      }

      const task = await apiPost<Task>("/tasks", payload);
      router.push(`/tasks/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="task-title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="task-title"
          placeholder="Short summary of the task"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) {
              setFieldErrors((prev) => ({ ...prev, title: "" }));
            }
          }}
          className="h-12 text-base"
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? "task-title-error" : undefined}
        />
        {fieldErrors.title && (
          <p id="task-title-error" className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="task-description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="task-description"
          placeholder="Describe what you want the agents to do..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) {
              setFieldErrors((prev) => ({ ...prev, description: "" }));
            }
          }}
          rows={6}
          className="text-base resize-y"
          aria-invalid={!!fieldErrors.description}
          aria-describedby={
            fieldErrors.description ? "task-description-error" : undefined
          }
        />
        {fieldErrors.description && (
          <p id="task-description-error" className="text-xs text-destructive">
            {fieldErrors.description}
          </p>
        )}
      </div>

      {/* Repository (optional) */}
      <div className="space-y-2">
        <label htmlFor="task-repo" className="text-sm font-medium">
          Repository{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          id="task-repo"
          placeholder="owner/repo"
          value={repo}
          onChange={(e) => {
            setRepo(e.target.value);
            if (fieldErrors.repo) {
              setFieldErrors((prev) => ({ ...prev, repo: "" }));
            }
          }}
          className="h-12 text-base"
          aria-invalid={!!fieldErrors.repo}
          aria-describedby={fieldErrors.repo ? "task-repo-error" : undefined}
        />
        {fieldErrors.repo && (
          <p id="task-repo-error" className="text-xs text-destructive">
            {fieldErrors.repo}
          </p>
        )}
      </div>

      {/* Agent Selection */}
      {!loadingAgents && agents.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="task-agent" className="text-sm font-medium">
            Agent <span className="text-destructive">*</span>
          </label>
          <select
            id="task-agent"
            value={agentId}
            onChange={(e) => {
              setAgentId(e.target.value);
              if (fieldErrors.agentId) {
                setFieldErrors((prev) => ({ ...prev, agentId: "" }));
              }
            }}
            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={!!fieldErrors.agentId}
            aria-describedby={
              fieldErrors.agentId ? "task-agent-error" : undefined
            }
          >
            <option value="" disabled>
              Select an agent…
            </option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
                {agent.description ? ` — ${agent.description}` : ""}
              </option>
            ))}
          </select>
          {fieldErrors.agentId && (
            <p id="task-agent-error" className="text-xs text-destructive">
              {fieldErrors.agentId}
            </p>
          )}
        </div>
      )}

      {/* Global error */}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={(!canSubmit && isFormDirty) || loading}
        className="w-full h-12 text-base"
      >
        {loading ? "Creating…" : "Create Task"}
      </Button>
    </form>
  );
}