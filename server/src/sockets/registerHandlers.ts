import { RoomManager } from '../rooms/RoomManager.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { broadcastRoomState } from './broadcast.js';
import { registerAnswerHandlers } from './handlers/answerHandlers.js';
import { registerConfigHandlers } from './handlers/configHandlers.js';
import { registerRoomHandlers } from './handlers/roomHandlers.js';
import type { AppServer, AppSocket, HandlerContext } from './types.js';

export function registerSocketHandlers(io: AppServer) {
  const roomManager = new RoomManager((room) => broadcastRoomState(io, room));
  const hostPasscode = process.env.HOST_PASSCODE || undefined;
  const rateLimiters = {
    // Room-code brute forcing: 5 join attempts per 10s per socket.
    joinRoom: new RateLimiter(5, 10_000),
    // Unbounded room creation / passcode guessing: 3 create attempts per minute per socket.
    createRoom: new RateLimiter(3, 60_000),
  };
  const ctx: HandlerContext = { io, roomManager, hostPasscode, rateLimiters };

  io.on('connection', (socket: AppSocket) => {
    registerRoomHandlers(socket, ctx);
    registerConfigHandlers(socket, ctx);
    registerAnswerHandlers(socket, ctx);
  });
}
