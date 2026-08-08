import { randomInt, randomUUID } from 'node:crypto';

const ROOM_CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L — avoids ambiguous glyphs

export function generateRoomCode(): string {
  return Array.from({ length: 4 }, () => ROOM_CODE_CHARSET[randomInt(ROOM_CODE_CHARSET.length)]).join('');
}

export function generateId(): string {
  return randomUUID();
}
