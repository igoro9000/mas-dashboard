"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";
import { getSocket, destroySocket } from "@/lib/socket";
import { useEventStore } from "@/stores/event-store";
import type { AgentEvent } from "@/types/event";
import type { AppSocket } from "@/lib/socket";

interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const addEvent = useEventStore((s) => s.addEvent);
  const socketRef = useRef<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      destroySocket();
      return;
    }

    const socketInstance = getSocket(token);
    socketRef.current = socketInstance;

    const handleEvent = (event: AgentEvent) => addEvent(event);
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on("agent:event", handleEvent);
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    socketInstance.connect();

    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off("agent:event", handleEvent);
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      destroySocket();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [session?.access_token, addEvent]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}