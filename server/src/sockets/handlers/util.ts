import type { Room } from '../../rooms/Room.js';
import type { AppSocket, HandlerContext } from '../types.js';

export function currentRoom(socket: AppSocket, roomManager: HandlerContext['roomManager']): Room | undefined {
  return roomManager.getRoom(socket.data.roomCode);
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

type AckResult = { success: boolean; error?: string };

export function withHostRoom(
  socket: AppSocket,
  roomManager: HandlerContext['roomManager'],
  ack: ((res: AckResult) => void) | undefined,
  fn: (room: Room) => void,
) {
  const room = currentRoom(socket, roomManager);
  if (!room || socket.data.role !== 'host') {
    ack?.({ success: false, error: 'Not the host of a room.' });
    return;
  }
  try {
    fn(room);
    ack?.({ success: true });
  } catch (err) {
    ack?.({ success: false, error: errorMessage(err) });
  }
}
