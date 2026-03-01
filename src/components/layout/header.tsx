"use client";

import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDeploymentStatus, type ServiceStatus } from "@/hooks/use-deployment-status";

const titles: Record<string, string> = {
  "/tasks": "Tasks",
  "/new-task": "New Task",
  "/chat": "Chat",
  "/agents": "Agents",
  "/settings": "Settings",
  "/login": "Sign In",
};

// ── Status dot ────────────────────────────────────────────────────────────────

const statusStyles: Record<ServiceStatus, { color: string; pulse: boolean; title: string }> = {
  ok:       { color: "bg-green-500",  pulse: false, title: "Deployed successfully" },
  building: { color: "bg-yellow-400", pulse: true,  title: "Building / deploying…"  },
  error:    { color: "bg-red-500",    pulse: true,  title: "Deployment failed"       },
  unknown:  { color: "bg-zinc-400",   pulse: false, title: "Status unknown"          },
};

function StatusDot({ status, label }: { status: ServiceStatus; label: string }) {
  const { color, pulse, title } = statusStyles[status];
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground" title={`${label}: ${title}`}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
      </span>
      <span className="font-medium">{label}</span>
    </span>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const isDetail = pathname.startsWith("/tasks/") && pathname !== "/tasks";
  const title = isDetail ? "Task Detail" : titles[pathname] ?? "MAS";
  const isChat = pathname === "/chat";

  const { vercel, railway } = useDeploymentStatus();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 items-center px-4 max-w-lg mx-auto">
        {isDetail && (
          <Link href="/tasks" className="mr-2 -ml-1 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}

        <h1 className="text-lg font-semibold">{title}</h1>

        {/* Deployment status – only shown on /chat */}
        {isChat && (
          <div className="ml-3 flex items-center gap-3">
            <span className="text-muted-foreground/40 text-sm select-none">|</span>
            <StatusDot status={vercel}  label="vercel"  />
            <StatusDot status={railway} label="railway" />
          </div>
        )}
      </div>
    </header>
  );
}
