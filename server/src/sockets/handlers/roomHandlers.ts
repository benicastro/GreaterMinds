import { ClientEvents } from '@greater-minds/shared';
import type { AppSocket, HandlerContext } from '../types.js';
import { currentRoom, errorMessage } from './util.js';

export function registerRoomHandlers(socket: AppSocket, ctx: HandlerContext) {
  const { roomManager, hostPasscode } = ctx;

  socket.on(ClientEvents.HostCreateRoom, ({ passcode }, ack) => {
    if (hostPasscode && passcode !== hostPasscode) {
      ack?.({ success: false, error: 'Incorrect host passcode.' });
      return;
    }
    const { room, hostSessionToken } = roomManager.createRoom();
    room.attachHostSocket(socket.id);
    socket.data.role = 'host';
    socket.data.roomCode = room.roomCode;
    socket.join(room.roomCode);
    ack?.({ success: true, roomCode: room.roomCode, hostSessionToken });
  });

  socket.on(ClientEvents.HostReconnect, ({ roomCode, hostSessionToken }, ack) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.hostSessionToken !== hostSessionToken) {
      ack?.({ success: false, error: 'Room not found.' });
      return;
    }
    room.attachHostSocket(socket.id);
    socket.data.role = 'host';
    socket.data.roomCode = room.roomCode;
    socket.join(room.roomCode);
    ack?.({ success: true, hostState: room.getHostSnapshot() });
  });

  socket.on(ClientEvents.PlayerJoinRoom, ({ roomCode, nickname }, ack) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      ack?.({ success: false, error: 'Room not found.' });
      return;
    }
    try {
      const { playerId, sessionToken } = room.addPlayer(nickname);
      room.attachPlayerSocket(playerId, socket.id);
      socket.data.role = 'player';
      socket.data.roomCode = room.roomCode;
      socket.data.playerId = playerId;
      socket.join(room.roomCode);
      ack?.({ success: true, playerId, sessionToken, playerState: room.getPlayerSnapshot(playerId) });
    } catch (err) {
      ack?.({ success: false, error: errorMessage(err) });
    }
  });

  socket.on(ClientEvents.PlayerReconnect, ({ roomCode, playerId, sessionToken }, ack) => {
    const room = roomManager.getRoom(roomCode);
    const player = room?.players.get(playerId);
    if (!room || !player || player.sessionToken !== sessionToken) {
      ack?.({ success: false, error: 'Room or player not found.' });
      return;
    }
    room.attachPlayerSocket(playerId, socket.id);
    socket.data.role = 'player';
    socket.data.roomCode = room.roomCode;
    socket.data.playerId = playerId;
    socket.join(room.roomCode);
    ack?.({ success: true, playerState: room.getPlayerSnapshot(playerId) });
  });

  socket.on(ClientEvents.PlayerLeaveRoom, (_payload, ack) => {
    const room = currentRoom(socket, roomManager);
    if (room && socket.data.playerId) {
      room.removePlayer(socket.data.playerId);
    }
    ack?.({ success: true });
  });

  socket.on('disconnect', () => {
    const room = currentRoom(socket, roomManager);
    if (!room) return;
    if (socket.data.role === 'host') {
      room.markHostDisconnected();
    } else if (socket.data.playerId) {
      room.markPlayerDisconnected(socket.data.playerId);
    }
  });
}
