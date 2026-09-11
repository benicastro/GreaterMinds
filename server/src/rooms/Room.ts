import {
  HostStateSnapshot,
  INTRO_SLIDE_COUNT,
  LeaderboardEntry,
  PlayerStateSnapshot,
  PROMPT_REGISTRY,
  PROMPTS_BY_ID,
  RevealPayload,
  RoomStatus,
  RoundStartedPayload,
  classifyAnswer,
  computeLeaderboard,
  pickRevealMessage,
} from '@greater-minds/shared';
import { getCompiledPrompt } from '../game/compiledPrompts.js';
import { RoundOutcome, scoreRound, SubmissionRecord } from '../game/scoring.js';
import { GameError } from '../utils/errors.js';
import { generateId } from '../utils/ids.js';

const MIN_TIMER_SECONDS = 5;
const MAX_TIMER_SECONDS = 120;
const DEFAULT_TIMER_SECONDS = 30;
const STARTING_SCORE = 10;

interface PlayerEntry {
  playerId: string;
  sessionToken: string;
  nickname: string;
  socketId: string | null;
  connected: boolean;
  disconnectedAt: number | null;
  score: number;
  eliminated: boolean;
}

interface RoundAnswer {
  raw: string;
  canonicalAnswer: string | null;
  submittedAt: number;
}

interface CurrentRound {
  promptId: string;
  roundNumber: number;
  startedAt: number;
  endsAt: number;
  answers: Map<string, RoundAnswer>;
  closing: boolean;
  timeoutHandle: ReturnType<typeof setTimeout> | null;
}

export class Room {
  readonly roomCode: string;
  readonly hostSessionToken: string;
  status: RoomStatus = 'lobby';
  hostSocketId: string | null = null;
  hostConnected = false;
  hostDisconnectedAt: number | null = null;
  readonly players = new Map<string, PlayerEntry>();
  selectedPromptIds: string[] = PROMPT_REGISTRY.map((prompt) => prompt.id);
  /** Per-room host answer override for each prompt, defaulted from its definition. */
  readonly hostAnswers = new Map<string, string>(PROMPT_REGISTRY.map((prompt) => [prompt.id, prompt.hostAnswer]));
  timerDurationSeconds = DEFAULT_TIMER_SECONDS;
  currentRoundIndex = -1;
  introSlideIndex = 0;
  lastActivityAt = Date.now();

  private currentRound: CurrentRound | null = null;
  private lastReveal: RevealPayload | null = null;
  private finalLeaderboard: LeaderboardEntry[] | null = null;
  private readonly onStateChange: () => void;

  constructor(roomCode: string, hostSessionToken: string, onStateChange: () => void) {
    this.roomCode = roomCode;
    this.hostSessionToken = hostSessionToken;
    this.onStateChange = onStateChange;
  }

  // ---- connection lifecycle ----

  attachHostSocket(socketId: string) {
    this.hostSocketId = socketId;
    this.hostConnected = true;
    this.hostDisconnectedAt = null;
    this.touch();
    this.onStateChange();
  }

  markHostDisconnected() {
    this.hostConnected = false;
    this.hostDisconnectedAt = Date.now();
    this.touch();
    this.onStateChange();
  }

  addPlayer(nickname: string): { playerId: string; sessionToken: string } {
    if (this.status !== 'lobby' && this.status !== 'configuring') {
      throw new GameError('GAME_ALREADY_STARTED', 'Cannot join — the game has already started.');
    }
    const trimmed = nickname.trim().slice(0, 24);
    const playerId = generateId();
    const sessionToken = generateId();
    this.players.set(playerId, {
      playerId,
      sessionToken,
      nickname: trimmed || 'Player',
      socketId: null,
      connected: false,
      disconnectedAt: null,
      score: STARTING_SCORE,
      eliminated: false,
    });
    this.touch();
    this.onStateChange();
    return { playerId, sessionToken };
  }

  attachPlayerSocket(playerId: string, socketId: string) {
    const player = this.players.get(playerId);
    if (!player) throw new GameError('UNKNOWN_PLAYER', 'Unknown player.');
    player.socketId = socketId;
    player.connected = true;
    player.disconnectedAt = null;
    this.touch();
    this.onStateChange();
  }

  markPlayerDisconnected(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;
    player.connected = false;
    player.disconnectedAt = Date.now();
    this.touch();
    this.onStateChange();
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
    this.touch();
    this.onStateChange();
  }

  /** Drops players who have been disconnected longer than the grace period. Returns true if anything changed. */
  sweepDisconnectedPlayers(graceMs: number): boolean {
    const now = Date.now();
    let changed = false;
    for (const [playerId, player] of this.players) {
      if (!player.connected && player.disconnectedAt !== null && now - player.disconnectedAt > graceMs) {
        this.players.delete(playerId);
        changed = true;
      }
    }
    if (changed) {
      this.touch();
      this.onStateChange();
    }
    return changed;
  }

  /** True once the host has been gone past its grace period, no players remain connected, and the room has been idle a while. */
  isAbandoned(hostGraceMs: number, idleMs: number): boolean {
    const now = Date.now();
    const hostGoneLongEnough = !this.hostConnected && (this.hostDisconnectedAt === null || now - this.hostDisconnectedAt > hostGraceMs);
    const noConnectedPlayers = Array.from(this.players.values()).every((player) => !player.connected);
    const idleLongEnough = now - this.lastActivityAt > idleMs;
    return hostGoneLongEnough && noConnectedPlayers && idleLongEnough;
  }

  /** Players still in the running (hard elimination: out for good once their score goes negative). */
  private activePlayerIds(): string[] {
    return Array.from(this.players.values())
      .filter((player) => !player.eliminated)
      .map((player) => player.playerId);
  }

  // ---- pre-game configuration ----

  updatePromptSelection(promptIds: string[]) {
    this.assertNotStarted();
    const unique = Array.from(new Set(promptIds));
    for (const id of unique) {
      if (!PROMPTS_BY_ID.has(id)) {
        throw new GameError('UNKNOWN_PROMPT', `Unknown prompt id: ${id}`);
      }
    }
    this.selectedPromptIds = unique;
    if (this.status === 'lobby') this.status = 'configuring';
    this.touch();
    this.onStateChange();
  }

  setHostAnswer(promptId: string, answer: string) {
    this.assertNotStarted();
    if (!PROMPTS_BY_ID.has(promptId)) {
      throw new GameError('UNKNOWN_PROMPT', `Unknown prompt id: ${promptId}`);
    }
    const result = classifyAnswer(getCompiledPrompt(promptId), answer);
    if (!result.valid || !result.canonicalAnswer) {
      throw new GameError('INVALID_HOST_ANSWER', `"${answer}" is not a valid answer for this prompt.`);
    }
    this.hostAnswers.set(promptId, result.canonicalAnswer);
    this.touch();
    this.onStateChange();
  }

  updateTimerConfig(seconds: number) {
    this.assertNotStarted();
    if (!Number.isFinite(seconds)) {
      throw new GameError('INVALID_TIMER', 'Timer duration must be a number.');
    }
    this.timerDurationSeconds = Math.min(MAX_TIMER_SECONDS, Math.max(MIN_TIMER_SECONDS, Math.round(seconds)));
    if (this.status === 'lobby') this.status = 'configuring';
    this.touch();
    this.onStateChange();
  }

  private assertNotStarted() {
    if (this.status !== 'lobby' && this.status !== 'configuring') {
      throw new GameError('GAME_ALREADY_STARTED', 'Cannot change configuration after the game has started.');
    }
  }

  // ---- round lifecycle ----

  startGame() {
    this.assertNotStarted();
    if (this.selectedPromptIds.length === 0) {
      throw new GameError('NO_PROMPTS_SELECTED', 'Select at least one prompt before starting.');
    }
    this.status = 'starting';
    this.introSlideIndex = 0;
    this.currentRoundIndex = -1;
    this.touch();
    this.onStateChange();
  }

  /** Advances the shared intro slide shown on the starting screen, or begins round 1 from the last slide. */
  advanceIntro() {
    if (this.status !== 'starting') {
      throw new GameError('NOT_STARTING', 'Can only advance the intro from the starting screen.');
    }
    if (this.introSlideIndex < INTRO_SLIDE_COUNT - 1) {
      this.introSlideIndex += 1;
      this.touch();
      this.onStateChange();
    } else {
      this.advanceRound();
    }
  }

  private advanceRound() {
    this.currentRoundIndex += 1;

    const outOfPrompts = this.currentRoundIndex >= this.selectedPromptIds.length;
    const noOneLeft = this.activePlayerIds().length === 0;
    if (outOfPrompts || noOneLeft) {
      this.status = 'game_over';
      this.currentRound = null;
      this.finalLeaderboard = this.buildFinalLeaderboard();
      this.touch();
      this.onStateChange();
      return;
    }

    const promptId = this.selectedPromptIds[this.currentRoundIndex];
    const startedAt = Date.now();
    const endsAt = startedAt + this.timerDurationSeconds * 1000;
    const timeoutHandle = setTimeout(() => this.closeRound(), this.timerDurationSeconds * 1000);

    this.currentRound = {
      promptId,
      roundNumber: this.currentRoundIndex + 1,
      startedAt,
      endsAt,
      answers: new Map(),
      closing: false,
      timeoutHandle,
    };
    this.status = 'in_round';
    this.lastReveal = null;
    this.touch();
    this.onStateChange();
  }

  submitAnswer(playerId: string, raw: string) {
    if (this.status !== 'in_round' || !this.currentRound || this.currentRound.closing) {
      throw new GameError('ROUND_NOT_ACTIVE', 'No active round to answer.');
    }
    const player = this.players.get(playerId);
    if (!player) {
      throw new GameError('UNKNOWN_PLAYER', 'Unknown player.');
    }
    if (player.eliminated) {
      throw new GameError('PLAYER_ELIMINATED', 'Eliminated players can no longer submit answers.');
    }
    if (this.currentRound.answers.has(playerId)) {
      return; // idempotent: first submission wins
    }
    if (typeof raw !== 'string' || raw.length === 0) {
      throw new GameError('EMPTY_ANSWER', 'Answer cannot be empty.');
    }

    const compiled = getCompiledPrompt(this.currentRound.promptId);
    const result = classifyAnswer(compiled, raw);
    this.currentRound.answers.set(playerId, {
      raw: raw.slice(0, 120),
      canonicalAnswer: result.valid ? result.canonicalAnswer! : null,
      submittedAt: Date.now(),
    });
    this.touch();

    if (this.currentRound.answers.size >= this.activePlayerIds().length) {
      this.closeRound();
    } else {
      this.onStateChange();
    }
  }

  forceCloseRound() {
    if (this.status !== 'in_round' || !this.currentRound) {
      throw new GameError('ROUND_NOT_ACTIVE', 'No active round.');
    }
    this.closeRound();
  }

  private closeRound() {
    if (!this.currentRound || this.currentRound.closing) return;
    this.currentRound.closing = true;
    if (this.currentRound.timeoutHandle) clearTimeout(this.currentRound.timeoutHandle);

    const def = PROMPTS_BY_ID.get(this.currentRound.promptId)!;
    const hostAnswer = this.hostAnswers.get(def.id) ?? def.hostAnswer;
    const submissions = new Map<string, SubmissionRecord>();
    for (const [playerId, answer] of this.currentRound.answers) {
      submissions.set(playerId, { raw: answer.raw, canonicalAnswer: answer.canonicalAnswer });
    }

    const allPlayerIds = this.activePlayerIds();
    const outcomes = scoreRound(hostAnswer, allPlayerIds, submissions);

    const perPlayer = allPlayerIds.map((playerId) => {
      const player = this.players.get(playerId)!;
      const outcome: RoundOutcome = outcomes.get(playerId)!;
      player.score += outcome.scoreDelta;
      const justEliminated = player.score < 0 && !player.eliminated;
      if (justEliminated) player.eliminated = true;
      return {
        playerId,
        nickname: player.nickname,
        rawAnswer: outcome.rawAnswer,
        canonicalAnswer: outcome.canonicalAnswer,
        outcome: outcome.outcome,
        scoreDelta: outcome.scoreDelta,
        message: pickRevealMessage(outcome.outcome),
        newScore: player.score,
        eliminated: justEliminated,
      };
    });

    this.lastReveal = {
      promptId: def.id,
      category: def.category,
      promptText: def.promptText,
      hostAnswer,
      perPlayer,
    };
    this.status = 'reveal';
    this.touch();
    this.onStateChange();
  }

  nextRound() {
    if (this.status !== 'reveal') {
      throw new GameError('NOT_IN_REVEAL', 'Can only advance to the next round after a reveal.');
    }
    this.advanceRound();
  }

  endGame() {
    if (this.currentRound?.timeoutHandle) clearTimeout(this.currentRound.timeoutHandle);
    this.status = 'game_over';
    this.currentRound = null;
    this.finalLeaderboard = this.buildFinalLeaderboard();
    this.touch();
    this.onStateChange();
  }

  private buildFinalLeaderboard(): LeaderboardEntry[] {
    return computeLeaderboard(
      Array.from(this.players.values()).map((player) => ({
        playerId: player.playerId,
        nickname: player.nickname,
        score: player.score,
        eliminated: player.eliminated,
      })),
    );
  }

  private touch() {
    this.lastActivityAt = Date.now();
  }

  // ---- snapshots ----

  private roundStartedPayload(): RoundStartedPayload {
    const round = this.currentRound!;
    const def = PROMPTS_BY_ID.get(round.promptId)!;
    return {
      promptId: def.id,
      category: def.category,
      promptText: def.promptText,
      endsAt: round.endsAt,
      durationSeconds: this.timerDurationSeconds,
      roundNumber: round.roundNumber,
      totalRounds: this.selectedPromptIds.length,
    };
  }

  getHostSnapshot(): HostStateSnapshot {
    return {
      roomCode: this.roomCode,
      status: this.status,
      players: Array.from(this.players.values()).map((p) => ({
        playerId: p.playerId,
        nickname: p.nickname,
        connected: p.connected,
        score: p.score,
        eliminated: p.eliminated,
      })),
      selectedPromptIds: this.selectedPromptIds,
      hostAnswers: Object.fromEntries(this.hostAnswers),
      timerDurationSeconds: this.timerDurationSeconds,
      currentRoundNumber: this.currentRound?.roundNumber ?? null,
      totalRounds: this.selectedPromptIds.length,
      currentRound: this.currentRound ? this.roundStartedPayload() : null,
      answeredCount: this.currentRound ? this.currentRound.answers.size : 0,
      reveal: this.status === 'reveal' ? this.lastReveal : null,
      finalLeaderboard: this.status === 'game_over' ? this.finalLeaderboard : null,
      introSlideIndex: this.status === 'starting' ? this.introSlideIndex : null,
    };
  }

  getPlayerSnapshot(playerId: string): PlayerStateSnapshot {
    const player = this.players.get(playerId);
    if (!player) throw new GameError('UNKNOWN_PLAYER', 'Unknown player.');

    // A player already eliminated before this round started has no entry in it (they're
    // spectating) — only build a personal reveal payload when they actually took part.
    const myEntry = this.lastReveal?.perPlayer.find((entry) => entry.playerId === playerId);
    const reveal = this.status === 'reveal' && this.lastReveal && myEntry ? { ...this.lastReveal, entry: myEntry } : null;

    return {
      roomCode: this.roomCode,
      playerId,
      nickname: player.nickname,
      status: this.status,
      score: player.score,
      eliminated: player.eliminated,
      currentRound: this.currentRound ? this.roundStartedPayload() : null,
      hasAnsweredCurrentRound: this.currentRound?.answers.has(playerId) ?? false,
      reveal,
      finalLeaderboard: this.status === 'game_over' ? this.finalLeaderboard : null,
      introSlideIndex: this.status === 'starting' ? this.introSlideIndex : null,
    };
  }
}
