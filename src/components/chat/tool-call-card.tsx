import React, { useState } from "react";

interface ToolCallCardProps {
  toolName: string;
  status: "pending" | "complete";
  result?: string;
}

export function ToolCallCard({ toolName, status, result }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (status === "complete") {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-2 bg-background shadow-sm">
      <button
        className="tool-call-toggle-btn flex items-center gap-2.5 w-full px-3.5 py-3 bg-transparent border-none cursor-pointer text-left min-h-[44px] rounded-lg transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] active:bg-muted/80 [-webkit-tap-highlight-color:transparent]"
        onClick={handleToggle}
        aria-expanded={status === "complete" ? isExpanded : undefined}
        aria-label={
          status === "complete"
            ? `${isExpanded ? "Collapse" : "Expand"} result for ${toolName}`
            : `${toolName} is running`
        }
        disabled={status === "pending"}
        style={{ cursor: status === "pending" ? "default" : "pointer" }}
      >
        {status === "pending" ? (
          <span
            className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        ) : (
          <svg
            className="w-4 h-4 flex-shrink-0 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <span
          className="text-[13px] font-semibold text-foreground flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
          title={toolName}
        >
          {toolName}
        </span>

        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            status === "pending"
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}
          aria-hidden="true"
        >
          {status === "pending" ? "Running" : "Done"}
        </span>

        {status === "complete" && (
          <svg
            className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-200${isExpanded ? " rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {status === "pending" && (
        <div
          className="h-[3px] bg-border rounded-b-lg overflow-hidden"
          aria-hidden="true"
        >
          <div className="tool-call-progress-bar-fill h-full w-[40%] bg-gradient-to-r from-primary to-primary/60 rounded-[3px]" />
        </div>
      )}

      {status === "complete" && isExpanded && (
        <div
          className="px-3.5 pb-3.5 pt-2.5 border-t border-border bg-muted/50"
          role="region"
          aria-label={`Result for ${toolName}`}
        >
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Result
          </div>
          <pre className="m-0 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {result ?? "No result returned."}
          </pre>
        </div>
      )}
    </div>
  );
}