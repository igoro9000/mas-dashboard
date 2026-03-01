"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { getSocket, destroySocket } from "@/lib/socket";
import { useEventStore } from "@/stores/event-store";
import type { AgentEvent } from "@/types/event";
import type { Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      destroySocket();
      return;
    }

    const socketInstance = getSocket(token);

    const handleEvent = (event: AgentEvent) => addEvent(event);
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on("agent:event", handleEvent);
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    socketInstance.connect();
    setSocket(socketInstance);

    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off("agent:event", handleEvent);
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      destroySocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session?.access_token, addEvent]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}