import { generateId, generateRoomCode } from '../utils/ids.js';
import { Room } from './Room.js';

const SWEEP_INTERVAL_MS = 30_000;
const PLAYER_DISCONNECT_GRACE_MS = 60_000;
const HOST_DISCONNECT_GRACE_MS = 5 * 60_000;
const ABANDONED_ROOM_IDLE_MS = 10 * 60_000;

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly sweepTimer: ReturnType<typeof setInterval>;

  constructor(private readonly onStateChange: (room: Room) => void) {
    this.sweepTimer = setInterval(() => this.sweep(), SWEEP_INTERVAL_MS);
    this.sweepTimer.unref();
  }

  createRoom(): { room: Room; hostSessionToken: string } {
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }
    const hostSessionToken = generateId();
    const room = new Room(roomCode, hostSessionToken, () => this.onStateChange(room));
    this.rooms.set(roomCode, room);
    return { room, hostSessionToken };
  }

  getRoom(roomCode: string | undefined): Room | undefined {
    if (!roomCode) return undefined;
    return this.rooms.get(roomCode.toUpperCase());
  }

  private sweep() {
    for (const [roomCode, room] of this.rooms) {
      room.sweepDisconnectedPlayers(PLAYER_DISCONNECT_GRACE_MS);
      if (room.isAbandoned(HOST_DISCONNECT_GRACE_MS, ABANDONED_ROOM_IDLE_MS)) {
        this.rooms.delete(roomCode);
      }
    }
  }
}
