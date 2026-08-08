import { RoomManager } from '../rooms/RoomManager.js';
import { broadcastRoomState } from './broadcast.js';
import { registerAnswerHandlers } from './handlers/answerHandlers.js';
import { registerConfigHandlers } from './handlers/configHandlers.js';
import { registerRoomHandlers } from './handlers/roomHandlers.js';
import type { AppServer, AppSocket, HandlerContext } from './types.js';

export function registerSocketHandlers(io: AppServer) {
  const roomManager = new RoomManager((room) => broadcastRoomState(io, room));
  const hostPasscode = process.env.HOST_PASSCODE || undefined;
  const ctx: HandlerContext = { io, roomManager, hostPasscode };

  io.on('connection', (socket: AppSocket) => {
    registerRoomHandlers(socket, ctx);
    registerConfigHandlers(socket, ctx);
    registerAnswerHandlers(socket, ctx);
  });
}
