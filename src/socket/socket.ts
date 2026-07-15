import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(getToken: () => string | null): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    // A function, not a static value — socket.io-client calls this on every
    // (re)connection attempt, so a reconnect after the access token rotates
    // (15min expiry) or after a server restart always sends the current
    // token instead of replaying the one captured at the first connect.
    auth: (cb) => cb({ token: getToken() }),
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinProject(projectId: string): void {
  getSocket()?.emit('join:project', { projectId });
}

export function leaveProject(projectId: string): void {
  getSocket()?.emit('leave:project', { projectId });
}
