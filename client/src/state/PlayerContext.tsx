import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ClientEvents, ServerEvents, type ActionError, type PlayerStateSnapshot } from '@greater-minds/shared';
import { socket } from '../socket';

const PLAYER_STORAGE_PREFIX = 'greaterMinds.player.';

interface StoredPlayerSession {
  roomCode: string;
  playerId: string;
  sessionToken: string;
}

interface JoinRoomAck {
  success: boolean;
  error?: string;
  playerId?: string;
  sessionToken?: string;
  playerState?: PlayerStateSnapshot;
}

interface PlayerContextValue {
  state: PlayerStateSnapshot | null;
  joined: boolean;
  joinError: string | null;
  actionError: string | null;
  joinRoom: (roomCode: string, nickname: string) => void;
  submitAnswer: (answer: string) => void;
  leaveRoom: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function storageKey(roomCode: string) {
  return `${PLAYER_STORAGE_PREFIX}${roomCode.toUpperCase()}`;
}

export function PlayerProvider({ children, roomCode }: { children: ReactNode; roomCode: string }) {
  const [state, setState] = useState<PlayerStateSnapshot | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const attemptedReconnect = useRef(false);

  useEffect(() => {
    function onPlayerState(snapshot: PlayerStateSnapshot) {
      setState(snapshot);
    }
    function onActionError(err: ActionError) {
      setActionError(err.message);
    }
    socket.on(ServerEvents.RoomPlayerState, onPlayerState);
    socket.on(ServerEvents.ActionError, onActionError);
    return () => {
      socket.off(ServerEvents.RoomPlayerState, onPlayerState);
      socket.off(ServerEvents.ActionError, onActionError);
    };
  }, []);

  useEffect(() => {
    if (attemptedReconnect.current || state) return;
    const stored = sessionStorage.getItem(storageKey(roomCode));
    if (!stored) return; // no prior session for this room — normal for a first-time joiner
    attemptedReconnect.current = true;
    let parsed: StoredPlayerSession;
    try {
      parsed = JSON.parse(stored);
    } catch {
      sessionStorage.removeItem(storageKey(roomCode));
      return;
    }
    if (parsed.roomCode !== roomCode) return;
    socket.emit(
      ClientEvents.PlayerReconnect,
      parsed,
      (res: { success: boolean; error?: string; playerState?: PlayerStateSnapshot }) => {
        if (res.success && res.playerState) {
          setState(res.playerState);
        } else {
          // Reconnect failed (e.g. room no longer exists) — fall back to the nickname form.
          sessionStorage.removeItem(storageKey(roomCode));
          setJoinError(res.error ?? null);
        }
      },
    );
  }, [roomCode, state]);

  // Socket.IO reconnects on its own after a drop (phone sleep, network blip), but the server sees
  // the new connection as anonymous. Re-attach to our seat every time the connection comes back,
  // so updates resume and answers are accepted without a page refresh.
  const joinedRef = useRef(false);
  joinedRef.current = state !== null;
  useEffect(() => {
    function onConnect() {
      if (!joinedRef.current) return; // first load is handled by the effect above
      const stored = sessionStorage.getItem(storageKey(roomCode));
      if (!stored) return;
      let parsed: StoredPlayerSession;
      try {
        parsed = JSON.parse(stored);
      } catch {
        return;
      }
      socket.emit(
        ClientEvents.PlayerReconnect,
        parsed,
        (res: { success: boolean; error?: string; playerState?: PlayerStateSnapshot }) => {
          if (res.success && res.playerState) {
            setState(res.playerState);
          } else {
            // Our seat is gone (e.g. server restarted, or dropped after the grace period).
            sessionStorage.removeItem(storageKey(roomCode));
            setState(null);
            setJoinError('Lost your spot in the room — join again to keep playing.');
          }
        },
      );
    }
    socket.on('connect', onConnect);
    return () => {
      socket.off('connect', onConnect);
    };
  }, [roomCode]);

  const joinRoom = useCallback((roomCodeInput: string, nickname: string) => {
    setJoinError(null);
    socket.emit(ClientEvents.PlayerJoinRoom, { roomCode: roomCodeInput, nickname }, (res: JoinRoomAck) => {
      if (!res.success || !res.playerState || !res.playerId || !res.sessionToken) {
        setJoinError(res.error ?? 'Failed to join room.');
        return;
      }
      const session: StoredPlayerSession = {
        roomCode: res.playerState.roomCode,
        playerId: res.playerId,
        sessionToken: res.sessionToken,
      };
      sessionStorage.setItem(storageKey(session.roomCode), JSON.stringify(session));
      setState(res.playerState);
    });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    socket.emit(ClientEvents.PlayerSubmitAnswer, { answer }, () => {
      // per-round outcome arrives via the next room:playerState broadcast
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit(ClientEvents.PlayerLeaveRoom, {}, () => {
      sessionStorage.removeItem(storageKey(roomCode));
      setState(null);
    });
  }, [roomCode]);

  const value = useMemo<PlayerContextValue>(
    () => ({ state, joined: state !== null, joinError, actionError, joinRoom, submitAnswer, leaveRoom }),
    [state, joinError, actionError, joinRoom, submitAnswer, leaveRoom],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
