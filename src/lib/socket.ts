import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket) return socket;
  socket = io(URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function destroySocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}