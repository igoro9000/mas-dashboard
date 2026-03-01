"use client";

import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const titles: Record<string, string> = {
  "/tasks": "Tasks",
  "/new-task": "New Task",
  "/chat": "Chat",
  "/agents": "Agents",
  "/settings": "Settings",
  "/login": "Sign In",
};

export function Header() {
  const pathname = usePathname();
  const isDetail = pathname.startsWith("/tasks/") && pathname !== "/tasks";
  const title = isDetail ? "Task Detail" : titles[pathname] ?? "MAS";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 items-center px-4 max-w-lg mx-auto">
        {isDetail && (
          <Link href="/tasks" className="mr-2 -ml-1 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
