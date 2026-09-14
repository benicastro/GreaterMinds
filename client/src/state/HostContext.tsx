import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ClientEvents,
  ServerEvents,
  type ActionError,
  type HostStateSnapshot,
  type RoundSelectionMode,
} from '@greater-minds/shared';
import { socket } from '../socket';

const HOST_STORAGE_KEY = 'greaterMinds.host';

interface StoredHostSession {
  roomCode: string;
  hostSessionToken: string;
}

interface SuccessAck {
  success: boolean;
  error?: string;
}

interface HostContextValue {
  roomCode: string | null;
  state: HostStateSnapshot | null;
  error: string | null;
  clearError: () => void;
  createRoom: (passcode: string) => void;
  updatePromptSelection: (promptIds: string[]) => void;
  setHostAnswer: (promptId: string, answer: string) => void;
  setRoundSelectionMode: (mode: RoundSelectionMode) => void;
  updateTimerConfig: (seconds: number) => void;
  startGame: () => void;
  advanceIntro: () => void;
  nextRound: () => void;
  forceCloseRound: () => void;
  endGame: () => void;
}

const HostContext = createContext<HostContextValue | null>(null);

export function HostProvider({ children, roomCodeFromRoute }: { children: ReactNode; roomCodeFromRoute?: string }) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [state, setState] = useState<HostStateSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attemptedReconnectFor = useRef<string | null>(null);

  useEffect(() => {
    function onHostState(snapshot: HostStateSnapshot) {
      setState(snapshot);
    }
    function onActionError(err: ActionError) {
      setError(err.message);
    }
    socket.on(ServerEvents.RoomHostState, onHostState);
    socket.on(ServerEvents.ActionError, onActionError);
    return () => {
      socket.off(ServerEvents.RoomHostState, onHostState);
      socket.off(ServerEvents.ActionError, onActionError);
    };
  }, []);

  useEffect(() => {
    if (!roomCodeFromRoute || roomCode || attemptedReconnectFor.current === roomCodeFromRoute) return;
    attemptedReconnectFor.current = roomCodeFromRoute;

    const stored = sessionStorage.getItem(HOST_STORAGE_KEY);
    if (!stored) {
      setError('No host session found for this room. Go back and create a new game.');
      return;
    }
    let parsed: StoredHostSession;
    try {
      parsed = JSON.parse(stored);
    } catch {
      setError('Stored host session was corrupted. Go back and create a new game.');
      return;
    }
    if (parsed.roomCode !== roomCodeFromRoute) {
      setError('This session belongs to a different room. Go back and create a new game.');
      return;
    }
    socket.emit(ClientEvents.HostReconnect, parsed, (res: SuccessAck & { hostState?: HostStateSnapshot }) => {
      if (res.success && res.hostState) {
        setState(res.hostState);
        setRoomCode(res.hostState.roomCode);
      } else {
        setError(res.error ?? 'Failed to reconnect to the room.');
      }
    });
  }, [roomCodeFromRoute, roomCode]);

  const createRoom = useCallback((passcode: string) => {
    socket.emit(
      ClientEvents.HostCreateRoom,
      { passcode },
      (res: SuccessAck & { roomCode?: string; hostSessionToken?: string }) => {
        if (!res.success || !res.roomCode || !res.hostSessionToken) {
          setError(res.error ?? 'Failed to create room.');
          return;
        }
        const session: StoredHostSession = { roomCode: res.roomCode, hostSessionToken: res.hostSessionToken };
        sessionStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(session));
        setRoomCode(session.roomCode);
      },
    );
  }, []);

  const ackHandler = useCallback((fallbackMessage: string) => {
    return (res: SuccessAck) => {
      if (!res.success) setError(res.error ?? fallbackMessage);
    };
  }, []);

  const updatePromptSelection = useCallback(
    (promptIds: string[]) => {
      socket.emit(ClientEvents.HostUpdatePromptSelection, { promptIds }, ackHandler('Failed to update prompt selection.'));
    },
    [ackHandler],
  );

  const setHostAnswer = useCallback(
    (promptId: string, answer: string) => {
      socket.emit(ClientEvents.HostSetHostAnswer, { promptId, answer }, ackHandler('Failed to update host answer.'));
    },
    [ackHandler],
  );

  const setRoundSelectionMode = useCallback(
    (mode: RoundSelectionMode) => {
      socket.emit(ClientEvents.HostSetRoundSelectionMode, { mode }, ackHandler('Failed to update round order mode.'));
    },
    [ackHandler],
  );

  const updateTimerConfig = useCallback(
    (seconds: number) => {
      socket.emit(ClientEvents.HostUpdateTimerConfig, { seconds }, ackHandler('Failed to update timer.'));
    },
    [ackHandler],
  );

  const startGame = useCallback(() => {
    socket.emit(ClientEvents.HostStartGame, {}, ackHandler('Failed to start game.'));
  }, [ackHandler]);

  const advanceIntro = useCallback(() => {
    socket.emit(ClientEvents.HostAdvanceIntro, {}, ackHandler('Failed to advance.'));
  }, [ackHandler]);

  const nextRound = useCallback(() => {
    socket.emit(ClientEvents.HostNextRound, {}, ackHandler('Failed to advance round.'));
  }, [ackHandler]);

  const forceCloseRound = useCallback(() => {
    socket.emit(ClientEvents.HostForceCloseRound, {}, ackHandler('Failed to close round.'));
  }, [ackHandler]);

  const endGame = useCallback(() => {
    socket.emit(ClientEvents.HostEndGame, {}, ackHandler('Failed to end game.'));
  }, [ackHandler]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<HostContextValue>(
    () => ({
      roomCode,
      state,
      error,
      clearError,
      createRoom,
      updatePromptSelection,
      setHostAnswer,
      setRoundSelectionMode,
      updateTimerConfig,
      startGame,
      advanceIntro,
      nextRound,
      forceCloseRound,
      endGame,
    }),
    [
      roomCode,
      state,
      error,
      clearError,
      createRoom,
      updatePromptSelection,
      setHostAnswer,
      setRoundSelectionMode,
      updateTimerConfig,
      startGame,
      advanceIntro,
      nextRound,
      forceCloseRound,
      endGame,
    ],
  );

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

export function useHost(): HostContextValue {
  const ctx = useContext(HostContext);
  if (!ctx) throw new Error('useHost must be used within a HostProvider');
  return ctx;
}
