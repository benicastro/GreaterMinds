import type { Server as IOServer, Socket as IOSocket } from 'socket.io';
import type { ActionError, HostStateSnapshot, PlayerStateSnapshot } from '@greater-minds/shared';
import type { RoomManager } from '../rooms/RoomManager.js';
import type { RateLimiter } from '../utils/rateLimiter.js';

export interface SocketData {
  role?: 'host' | 'player';
  roomCode?: string;
  playerId?: string;
}

interface SuccessAck {
  success: boolean;
  error?: string;
}

export interface ClientToServerEvents {
  'host:createRoom': (
    payload: { passcode?: string },
    ack: (res: SuccessAck & { roomCode?: string; hostSessionToken?: string }) => void,
  ) => void;
  'host:reconnect': (
    payload: { roomCode: string; hostSessionToken: string },
    ack: (res: SuccessAck & { hostState?: HostStateSnapshot }) => void,
  ) => void;
  'player:joinRoom': (
    payload: { roomCode: string; nickname: string },
    ack: (res: SuccessAck & { playerId?: string; sessionToken?: string; playerState?: PlayerStateSnapshot }) => void,
  ) => void;
  'player:reconnect': (
    payload: { roomCode: string; playerId: string; sessionToken: string },
    ack: (res: SuccessAck & { playerState?: PlayerStateSnapshot }) => void,
  ) => void;
  'host:updatePromptSelection': (payload: { promptIds: string[] }, ack: (res: SuccessAck) => void) => void;
  'host:setHostAnswer': (payload: { promptId: string; answer: string }, ack: (res: SuccessAck) => void) => void;
  'host:updateTimerConfig': (payload: { seconds: number }, ack: (res: SuccessAck) => void) => void;
  'host:startGame': (payload: Record<string, never>, ack: (res: SuccessAck) => void) => void;
  'host:advanceIntro': (payload: Record<string, never>, ack: (res: SuccessAck) => void) => void;
  'player:submitAnswer': (payload: { answer: string }, ack: (res: { received: boolean }) => void) => void;
  'host:forceCloseRound': (payload: Record<string, never>, ack: (res: SuccessAck) => void) => void;
  'host:nextRound': (payload: Record<string, never>, ack: (res: SuccessAck) => void) => void;
  'host:endGame': (payload: Record<string, never>, ack: (res: SuccessAck) => void) => void;
  'player:leaveRoom': (payload: Record<string, never>, ack: (res: SuccessAck) => void) => void;
}

export interface ServerToClientEvents {
  'room:hostState': (snapshot: HostStateSnapshot) => void;
  'room:playerState': (snapshot: PlayerStateSnapshot) => void;
  actionError: (error: ActionError) => void;
}

export type AppServer = IOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type AppSocket = IOSocket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export interface HandlerContext {
  io: AppServer;
  roomManager: RoomManager;
  /** Required to create a room. Undefined means hosting is unrestricted (no passcode configured). */
  hostPasscode: string | undefined;
  /** Bounds cheap-to-retry, guessable actions per socket connection — see rateLimiter.ts. */
  rateLimiters: {
    createRoom: RateLimiter;
    joinRoom: RateLimiter;
  };
}
