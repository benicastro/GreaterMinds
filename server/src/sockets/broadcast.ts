import { ServerEvents } from '@greater-minds/shared';
import type { Room } from '../rooms/Room.js';
import type { AppServer } from './types.js';

export function broadcastRoomState(io: AppServer, room: Room) {
  if (room.hostSocketId) {
    io.to(room.hostSocketId).emit(ServerEvents.RoomHostState, room.getHostSnapshot());
  }
  for (const player of room.players.values()) {
    if (player.socketId) {
      io.to(player.socketId).emit(ServerEvents.RoomPlayerState, room.getPlayerSnapshot(player.playerId));
    }
  }
  if (room.displaySocketIds.size > 0) {
    const displayState = room.getDisplaySnapshot();
    for (const socketId of room.displaySocketIds) {
      io.to(socketId).emit(ServerEvents.RoomDisplayState, displayState);
    }
  }
}
