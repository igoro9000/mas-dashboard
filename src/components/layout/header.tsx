"use client";

import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const titles: Record<string, string> = {
  "/tasks": "Tasks",
  "/new-task": "New Task",
  "/chat": "Chat",
  "/agents": "Agents",
  "/settings": "Settings",
  "/login": "Sign In",
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isDetail = pathname.startsWith("/tasks/") && pathname !== "/tasks";
  const title = isDetail ? "Task Detail" : titles[pathname] ?? "MAS";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 items-center px-4 max-w-lg mx-auto">
        {isDetail && (
          <Link href="/tasks" className="mr-2 -ml-1 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="text-lg font-semibold flex-1">{title}</h1>

        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name ?? "User avatar"}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(session.user.name, session.user.email)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {session.user.name && (
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                  )}
                  {session.user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => signOut({ callbackUrl: "/login" })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}