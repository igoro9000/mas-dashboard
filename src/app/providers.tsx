"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <AuthProvider>
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <Shell>{children}</Shell>
        </QueryClientProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="min-h-dvh flex flex-col">
      {!isLogin && <Header />}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-20">
        {children}
      </main>
      {!isLogin && <BottomNav />}
    </div>
  );
}