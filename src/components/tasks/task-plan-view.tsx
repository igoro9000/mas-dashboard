"use client";

import type { PlannerOutput } from "@/types/task";
import { FileCode, ArrowRight } from "lucide-react";

export function TaskPlanView({ plan }: { plan: PlannerOutput }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Plan</h3>
      <p className="text-sm text-muted-foreground">{plan.summary}</p>

      <ol className="space-y-1.5">
        {plan.steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-muted-foreground shrink-0">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {plan.files.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground">Files</h4>
          {plan.files.map((f) => (
            <div key={f.path} className="flex items-center gap-2 text-xs">
              <FileCode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono">{f.path}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{f.action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
