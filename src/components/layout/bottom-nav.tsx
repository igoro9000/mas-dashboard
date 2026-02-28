"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, PlusCircle, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/new-task", label: "New", icon: PlusCircle },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14 items-center justify-around max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
