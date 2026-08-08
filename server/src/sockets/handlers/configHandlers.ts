import { ClientEvents } from '@greater-minds/shared';
import type { AppSocket, HandlerContext } from '../types.js';
import { withHostRoom } from './util.js';

export function registerConfigHandlers(socket: AppSocket, ctx: HandlerContext) {
  const { roomManager } = ctx;

  socket.on(ClientEvents.HostUpdatePromptSelection, ({ promptIds }, ack) => {
    withHostRoom(socket, roomManager, ack, (room) => room.updatePromptSelection(promptIds));
  });

  socket.on(ClientEvents.HostUpdateTimerConfig, ({ seconds }, ack) => {
    withHostRoom(socket, roomManager, ack, (room) => room.updateTimerConfig(seconds));
  });

  socket.on(ClientEvents.HostStartGame, (_payload, ack) => {
    withHostRoom(socket, roomManager, ack, (room) => room.startGame());
  });
}
