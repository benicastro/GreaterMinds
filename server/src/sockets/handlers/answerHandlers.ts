import { ClientEvents, ServerEvents } from '@greater-minds/shared';
import { GameError } from '../../utils/errors.js';
import type { AppSocket, HandlerContext } from '../types.js';
import { currentRoom, errorMessage, withHostRoom } from './util.js';

export function registerAnswerHandlers(socket: AppSocket, ctx: HandlerContext) {
  const { roomManager } = ctx;

  socket.on(ClientEvents.PlayerSubmitAnswer, ({ answer }, ack) => {
    const room = currentRoom(socket, roomManager);
    const playerId = socket.data.playerId;
    if (!room || !playerId) {
      ack?.({ received: false });
      return;
    }
    try {
      room.submitAnswer(playerId, answer);
      ack?.({ received: true });
    } catch (err) {
      socket.emit(ServerEvents.ActionError, {
        code: err instanceof GameError ? err.code : 'UNKNOWN',
        message: errorMessage(err),
      });
      ack?.({ received: false });
    }
  });

  socket.on(ClientEvents.HostForceCloseRound, (_payload, ack) => {
    withHostRoom(socket, roomManager, ack, (room) => room.forceCloseRound());
  });

  socket.on(ClientEvents.HostNextRound, (_payload, ack) => {
    withHostRoom(socket, roomManager, ack, (room) => room.nextRound());
  });

  socket.on(ClientEvents.HostEndGame, (_payload, ack) => {
    withHostRoom(socket, roomManager, ack, (room) => room.endGame());
  });
}
