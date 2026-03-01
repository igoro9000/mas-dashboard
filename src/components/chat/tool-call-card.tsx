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
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "8px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .tool-call-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        .tool-call-progress-bar-track {
          height: 3px;
          background-color: #e2e8f0;
          border-radius: 0 0 8px 8px;
          overflow: hidden;
        }

        .tool-call-progress-bar-fill {
          height: 100%;
          width: 40%;
          background: linear-gradient(90deg, #6366f1, #818cf8);
          border-radius: 3px;
          animation: progress-slide 1.2s ease-in-out infinite;
        }

        .tool-call-toggle-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 14px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          min-height: 44px;
          min-width: 44px;
          border-radius: 8px;
          transition: background-color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .tool-call-toggle-btn:hover {
          background-color: #f8fafc;
        }

        .tool-call-toggle-btn:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: -2px;
        }

        .tool-call-toggle-btn:active {
          background-color: #f1f5f9;
        }

        .tool-call-chevron {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #94a3b8;
          transition: transform 0.2s ease;
        }

        .tool-call-chevron.expanded {
          transform: rotate(180deg);
        }

        .tool-call-result {
          padding: 10px 14px 14px 14px;
          border-top: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }

        .tool-call-result pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          line-height: 1.6;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .tool-call-result-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .tool-call-name {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tool-call-status-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .tool-call-status-badge.pending {
          background-color: #ede9fe;
          color: #6d28d9;
        }

        .tool-call-status-badge.complete {
          background-color: #dcfce7;
          color: #15803d;
        }

        .tool-call-checkmark {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #22c55e;
        }
      `}</style>

      <button
        className="tool-call-toggle-btn"
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
          <span className="tool-call-spinner" aria-hidden="true" />
        ) : (
          <svg
            className="tool-call-checkmark"
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

        <span className="tool-call-name" title={toolName}>
          {toolName}
        </span>

        <span
          className={`tool-call-status-badge ${status}`}
          aria-hidden="true"
        >
          {status === "pending" ? "Running" : "Done"}
        </span>

        {status === "complete" && (
          <svg
            className={`tool-call-chevron${isExpanded ? " expanded" : ""}`}
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
        <div className="tool-call-progress-bar-track" aria-hidden="true">
          <div className="tool-call-progress-bar-fill" />
        </div>
      )}

      {status === "complete" && isExpanded && (
        <div className="tool-call-result" role="region" aria-label={`Result for ${toolName}`}>
          <div className="tool-call-result-label">Result</div>
          <pre>{result ?? "No result returned."}</pre>
        </div>
      )}
    </div>
  );
}