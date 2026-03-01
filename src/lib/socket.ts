import { io, Socket } from "socket.io-client";

// ---------------------------------------------------------------------------
// Typed event payloads
// ---------------------------------------------------------------------------

export interface TaskUpdatePayload {
  taskId: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress?: number;
  result?: unknown;
  error?: string;
  updatedAt: string;
}

export interface AgentStatusPayload {
  agentId: string;
  status: "idle" | "busy" | "offline" | "error";
  currentTaskId?: string;
  metadata?: Record<string, unknown>;
  updatedAt: string;
}

export interface ChatMessagePayload {
  messageId: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  createdAt: string;
}

export interface EventNewPayload {
  eventId: string;
  type: string;
  source: string;
  data: unknown;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Typed socket event maps (ServerToClient / ClientToServer)
// ---------------------------------------------------------------------------

export interface ServerToClientEvents {
  "task:update": (payload: TaskUpdatePayload) => void;
  "agent:status": (payload: AgentStatusPayload) => void;
  "chat:message": (payload: ChatMessagePayload) => void;
  "event:new": (payload: EventNewPayload) => void;
  connect_error: (err: Error) => void;
}

export interface ClientToServerEvents {
  "task:subscribe": (taskId: string) => void;
  "task:unsubscribe": (taskId: string) => void;
  "agent:subscribe": (agentId: string) => void;
  "agent:unsubscribe": (agentId: string) => void;
  "chat:join": (conversationId: string) => void;
  "chat:leave": (conversationId: string) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ---------------------------------------------------------------------------
// Connection configuration
// ---------------------------------------------------------------------------

const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1_000; // ms
const RECONNECTION_DELAY_MAX = 10_000; // ms

const URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------

let socket: AppSocket | null = null;

// ---------------------------------------------------------------------------
// Lifecycle helpers
// ---------------------------------------------------------------------------

function attachConnectionHandlers(sock: AppSocket): void {
  sock.on("connect", () => {
    console.info("[socket] Connected — id:", sock.id);
  });

  sock.on("disconnect", (reason) => {
    console.warn("[socket] Disconnected —", reason);

    // Socket.io will automatically attempt reconnection for transport-level
    // disconnects. For server-initiated disconnects we do nothing extra.
    if (reason === "io server disconnect") {
      // The server explicitly closed the connection; reconnect manually.
      sock.connect();
    }
  });

  sock.on("connect_error", (err) => {
    console.error("[socket] Connection error —", err.message);
  });

  sock.io.on("reconnect", (attempt) => {
    console.info(`[socket] Reconnected after ${attempt} attempt(s)`);
  });

  sock.io.on("reconnect_attempt", (attempt) => {
    console.info(`[socket] Reconnection attempt #${attempt}`);
  });

  sock.io.on("reconnect_error", (err) => {
    console.error("[socket] Reconnection error —", err.message);
  });

  sock.io.on("reconnect_failed", () => {
    console.error("[socket] Reconnection failed — giving up after max attempts");
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the singleton AppSocket, creating and connecting it on first call.
 *
 * @param token  JWT (or similar) used in the Socket.io auth handshake.
 */
export function getSocket(token: string): AppSocket {
  if (socket && socket.connected) return socket;

  // If a disconnected socket exists we destroy it and recreate so that a fresh
  // token is always passed through the auth handshake.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: RECONNECTION_ATTEMPTS,
    reconnectionDelay: RECONNECTION_DELAY,
    reconnectionDelayMax: RECONNECTION_DELAY_MAX,
    timeout: 20_000,
  }) as AppSocket;

  attachConnectionHandlers(socket);
  socket.connect();

  return socket;
}

/**
 * Disconnects and destroys the singleton socket.
 * Call this on user logout or unmount of the top-level provider.
 */
export function destroySocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.info("[socket] Socket destroyed");
  }
}

/**
 * Returns the current socket instance without creating one.
 * Useful for components that should only consume an existing connection.
 */
export function getExistingSocket(): AppSocket | null {
  return socket;
}

/**
 * Convenience: subscribe to a specific task's update stream.
 */
export function subscribeToTask(taskId: string): void {
  socket?.emit("task:subscribe", taskId);
}

/**
 * Convenience: unsubscribe from a specific task's update stream.
 */
export function unsubscribeFromTask(taskId: string): void {
  socket?.emit("task:unsubscribe", taskId);
}

/**
 * Convenience: subscribe to an agent's status stream.
 */
export function subscribeToAgent(agentId: string): void {
  socket?.emit("agent:subscribe", agentId);
}

/**
 * Convenience: unsubscribe from an agent's status stream.
 */
export function unsubscribeFromAgent(agentId: string): void {
  socket?.emit("agent:unsubscribe", agentId);
}

/**
 * Convenience: join a chat conversation room.
 */
export function joinConversation(conversationId: string): void {
  socket?.emit("chat:join", conversationId);
}

/**
 * Convenience: leave a chat conversation room.
 */
export function leaveConversation(conversationId: string): void {
  socket?.emit("chat:leave", conversationId);
}