"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <Shell>{children}</Shell>
      </SocketProvider>
    </AuthProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isChat = pathname === "/chat";

  return (
    <div className={isChat ? "h-dvh overflow-hidden flex flex-col" : "min-h-dvh flex flex-col"}>
      {!isLogin && <Header />}
      <main className={isChat
        ? "flex-1 min-h-0"
        : "flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-20"
      }>
        {children}
      </main>
      {!isLogin && <BottomNav />}
    </div>
  );
}
