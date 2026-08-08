import { io, Socket } from 'socket.io-client';

// No URL -> same origin. In dev, Vite proxies /socket.io to the server (see vite.config.ts).
// In production, the server serves this built client itself, so it's also same-origin.
export const socket: Socket = io({
  autoConnect: true,
});
