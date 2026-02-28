"use client";

import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { getSocket, destroySocket } from "@/lib/socket";
import { useEventStore } from "@/stores/event-store";
import type { AgentEvent } from "@/types/event";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const addEvent = useEventStore((s) => s.addEvent);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      destroySocket();
      return;
    }

    const socket = getSocket(token);

    const handleEvent = (event: AgentEvent) => addEvent(event);
    socket.on("agent:event", handleEvent);
    socket.connect();

    return () => {
      socket.off("agent:event", handleEvent);
      destroySocket();
    };
  }, [session?.access_token, addEvent]);

  return <>{children}</>;
}
