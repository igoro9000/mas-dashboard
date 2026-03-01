"use client";

import type { PlannerOutput } from "@/types/task";
import { FileCode, ArrowRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskPlanViewProps {
  plan: PlannerOutput;
  currentStep?: number;
  completedSteps?: number[];
}

export function TaskPlanView({ plan, currentStep, completedSteps = [] }: TaskPlanViewProps) {
  const isStepCompleted = (index: number) => completedSteps.includes(index);
  const isCurrentStep = (index: number) => currentStep === index;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Plan</h3>
      <p className="text-sm text-muted-foreground">{plan.summary}</p>

      <ol className="space-y-2">
        {plan.steps.map((step, i) => {
          const completed = isStepCompleted(i);
          const current = isCurrentStep(i);

          return (
            <li
              key={i}
              className={cn(
                "flex gap-2.5 text-sm rounded-md px-2 py-1.5 transition-colors",
                current && "bg-muted",
                completed && "text-muted-foreground"
              )}
            >
              <span className="mt-0.5 shrink-0">
                {completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : current ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              <span
                className={cn(
                  "leading-snug",
                  completed && "line-through decoration-muted-foreground/50",
                  current && "font-medium text-foreground"
                )}
              >
                {step}
              </span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground self-start mt-0.5">
                {i + 1}/{plan.steps.length}
              </span>
            </li>
          );
        })}
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