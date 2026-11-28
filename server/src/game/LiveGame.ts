import {
  LIVE_MAX_STRIKES,
  LIVE_PROMPTS_BY_ID,
  LiveAdaptiveSelector,
  computeLiveStandings,
  type LiveHostState,
  type LivePhase,
  type LivePlayerState,
  type LiveRankedStanding,
  type LiveReviewEntry,
  type LiveRoundResult,
  type LiveRoundTier,
  type RoomStatus,
  type RoundSelectionMode,
  type RoundStartedPayload,
} from '@greater-minds/shared';
import { GameError } from '../utils/errors.js';

const MAX_ANSWER_LENGTH = 60;

/** The slice of a Room that a LiveGame needs — players, timer config, and a way to set status/notify. */
export interface LiveGameHost {
  readonly players: ReadonlyMap<string, { playerId: string; nickname: string; connected: boolean }>;
  readonly timerDurationSeconds: number;
  getStatus(): RoomStatus;
  setStatus(status: RoomStatus): void;
  /** Mark activity and broadcast new snapshots. */
  changed(): void;
}

interface LiveRound {
  promptId: string;
  /** Adaptive mode only: which tier the prompt came from and which one the player count wanted. */
  tier: LiveRoundTier | null;
  roundNumber: number;
  phase: LivePhase;
  endsAt: number;
  /** Who was still in when the round began — the only players who can answer or be struck. */
  participantIds: string[];
  answers: Map<string, string>;
  hostAnswer: string | null;
  closing: boolean;
  timeoutHandle: ReturnType<typeof setTimeout> | null;
}

/**
 * Live Mode rules engine, kept entirely separate from Classic's scoring:
 * - Every player starts with 0 strikes; reaching 3 eliminates them.
 * - Players type answers on their phones; after the round they read them aloud, and the host
 *   marks strikes by hand (at most one per player per round). No answer = a pre-marked strike.
 * - Strikes only apply when the host confirms the round. If confirming would eliminate every
 *   remaining player, that round's strikes are thrown out instead.
 * - With exactly two players left, the round is a "final two" round: the host also types an
 *   answer, and players must avoid it as well as each other (the host still judges by hand).
 * - The game ends when one player is left, the prompts run out, or the host ends it.
 * - Round order: 'fixed' plays the host's list top to bottom; 'adaptive' (the default) picks each
 *   round's prompt by tier to fit the players still in (see `LiveAdaptiveSelector`).
 */
export class LiveGame {
  private readonly promptIds: string[];
  /** Null in fixed round order. */
  private readonly selector: LiveAdaptiveSelector | null;
  private roundIndex = -1;
  private readonly strikes = new Map<string, number>();
  private readonly eliminatedInRound = new Map<string, number>();
  private round: LiveRound | null = null;
  private review: Map<string, LiveReviewEntry> | null = null;
  private result: LiveRoundResult | null = null;
  private finalStandings: LiveRankedStanding[] | null = null;

  constructor(
    private readonly host: LiveGameHost,
    promptIds: string[],
    roundSelectionMode: RoundSelectionMode = 'adaptive',
    random: () => number = Math.random,
  ) {
    this.promptIds = [...promptIds];
    this.selector = roundSelectionMode === 'adaptive' ? new LiveAdaptiveSelector(this.promptIds, random) : null;
  }

  // ---- queries ----

  private strikesFor(playerId: string): number {
    return this.strikes.get(playerId) ?? 0;
  }

  isEliminated(playerId: string): boolean {
    return this.eliminatedInRound.has(playerId);
  }

  private activePlayerIds(): string[] {
    return Array.from(this.host.players.keys()).filter((id) => !this.isEliminated(id));
  }

  private standings(): LiveRankedStanding[] {
    return computeLiveStandings(
      Array.from(this.host.players.values()).map((player) => ({
        playerId: player.playerId,
        nickname: player.nickname,
        connected: player.connected,
        strikes: this.strikesFor(player.playerId),
        eliminated: this.isEliminated(player.playerId),
        eliminatedInRound: this.eliminatedInRound.get(player.playerId) ?? null,
      })),
    );
  }

  hasAnswered(playerId: string): boolean {
    return this.round?.answers.has(playerId) ?? false;
  }

  answeredCount(): number {
    return this.round?.answers.size ?? 0;
  }

  activeCount(): number {
    return this.activePlayerIds().length;
  }

  currentRoundNumber(): number | null {
    return this.round?.roundNumber ?? null;
  }

  totalRounds(): number {
    return this.promptIds.length;
  }

  /** Only meaningful while a round exists (in_round or reveal). */
  roundStartedPayload(): RoundStartedPayload | null {
    if (!this.round) return null;
    const def = LIVE_PROMPTS_BY_ID.get(this.round.promptId)!;
    return {
      promptId: def.id,
      category: def.category,
      promptText: def.promptText,
      endsAt: this.round.endsAt,
      durationSeconds: this.host.timerDurationSeconds,
      roundNumber: this.round.roundNumber,
      totalRounds: this.promptIds.length,
    };
  }

  // ---- round lifecycle ----

  startRound() {
    if (this.round?.timeoutHandle) clearTimeout(this.round.timeoutHandle);
    this.roundIndex += 1;
    this.review = null;
    this.result = null;

    const active = this.activePlayerIds();
    if (this.roundIndex >= this.promptIds.length || active.length <= 1) {
      this.finish();
      return;
    }

    // Every round uses up one prompt in either mode, so `roundIndex` still bounds the game.
    let promptId: string;
    let tier: LiveRoundTier | null = null;
    if (this.selector) {
      const pick = this.selector.next(active.length);
      if (!pick) {
        this.finish();
        return;
      }
      promptId = pick.promptId;
      tier = { tier: pick.tier, wantedTier: pick.wantedTier, opener: pick.opener };
    } else {
      promptId = this.promptIds[this.roundIndex];
    }

    const durationMs = this.host.timerDurationSeconds * 1000;
    this.round = {
      promptId,
      tier,
      roundNumber: this.roundIndex + 1,
      phase: active.length === 2 ? 'final_two' : 'group',
      endsAt: Date.now() + durationMs,
      participantIds: active,
      answers: new Map(),
      hostAnswer: null,
      closing: false,
      timeoutHandle: setTimeout(() => this.closeRound(), durationMs),
    };
    this.host.setStatus('in_round');
    this.host.changed();
  }

  submitAnswer(playerId: string, raw: string) {
    const round = this.assertRoundOpen();
    if (!this.host.players.has(playerId)) throw new GameError('UNKNOWN_PLAYER', 'Unknown player.');
    if (!round.participantIds.includes(playerId)) {
      throw new GameError('PLAYER_ELIMINATED', 'Eliminated players can no longer submit answers.');
    }
    if (round.answers.has(playerId)) return; // first submission wins
    const answer = typeof raw === 'string' ? raw.trim().slice(0, MAX_ANSWER_LENGTH) : '';
    if (!answer) throw new GameError('EMPTY_ANSWER', 'Answer cannot be empty.');
    round.answers.set(playerId, answer);
    this.closeIfEveryoneAnswered();
  }

  submitHostAnswer(raw: string) {
    const round = this.assertRoundOpen();
    if (round.phase !== 'final_two') {
      throw new GameError('NOT_FINAL_TWO', "The host's answer only counts once two players are left.");
    }
    if (round.hostAnswer !== null) return; // locked once typed
    const answer = typeof raw === 'string' ? raw.trim().slice(0, MAX_ANSWER_LENGTH) : '';
    if (!answer) throw new GameError('EMPTY_ANSWER', 'Answer cannot be empty.');
    round.hostAnswer = answer;
    this.closeIfEveryoneAnswered();
  }

  private closeIfEveryoneAnswered() {
    const round = this.round!;
    const playersDone = round.participantIds.every((id) => round.answers.has(id) || !this.host.players.has(id));
    const hostDone = round.phase !== 'final_two' || round.hostAnswer !== null;
    if (playersDone && hostDone) {
      this.closeRound();
    } else {
      this.host.changed();
    }
  }

  forceCloseRound() {
    this.assertRoundOpen();
    this.closeRound();
  }

  private closeRound() {
    const round = this.round;
    if (!round || round.closing) return;
    round.closing = true;
    if (round.timeoutHandle) clearTimeout(round.timeoutHandle);

    this.review = new Map();
    for (const playerId of round.participantIds) {
      const player = this.host.players.get(playerId);
      if (!player) continue; // left mid-round
      const answer = round.answers.get(playerId) ?? null;
      this.review.set(playerId, {
        playerId,
        nickname: player.nickname,
        answer,
        strikesBefore: this.strikesFor(playerId),
        strike: answer === null, // no answer = automatic strike, which the host can still lift
      });
    }
    this.result = null;
    this.host.setStatus('reveal');
    this.host.changed();
  }

  setStrike(playerId: string, strike: boolean) {
    const entry = this.assertReviewOpen().get(playerId);
    if (!entry) throw new GameError('UNKNOWN_PLAYER', 'That player is not in this round.');
    entry.strike = Boolean(strike);
    this.host.changed();
  }

  confirmRound() {
    const review = this.assertReviewOpen();
    const roundNumber = this.round!.roundNumber;
    const struck = Array.from(review.values()).filter((entry) => entry.strike);
    const wouldEliminate = struck.filter((entry) => this.strikesFor(entry.playerId) + 1 >= LIVE_MAX_STRIKES);
    const activeNow = this.activePlayerIds();
    const strikesVoided = wouldEliminate.length > 0 && wouldEliminate.length >= activeNow.length;

    if (strikesVoided) {
      this.result = { struckPlayerIds: [], eliminatedPlayerIds: [], strikesVoided: true };
    } else {
      for (const entry of struck) {
        this.strikes.set(entry.playerId, this.strikesFor(entry.playerId) + 1);
      }
      for (const entry of wouldEliminate) {
        this.eliminatedInRound.set(entry.playerId, roundNumber);
      }
      this.result = {
        struckPlayerIds: struck.map((entry) => entry.playerId),
        eliminatedPlayerIds: wouldEliminate.map((entry) => entry.playerId),
        strikesVoided: false,
      };
    }
    this.host.changed();
  }

  nextRound() {
    if (this.host.getStatus() !== 'reveal' || !this.result) {
      throw new GameError('ROUND_NOT_CONFIRMED', "Confirm this round's strikes before moving on.");
    }
    this.startRound();
  }

  /** True once the next advance would end the game (one player left, or no prompts left). */
  isDecided(): boolean {
    return this.activeCount() <= 1 || this.roundIndex + 1 >= this.promptIds.length;
  }

  end() {
    if (this.round?.timeoutHandle) clearTimeout(this.round.timeoutHandle);
    this.finish();
  }

  private finish() {
    this.round = null;
    this.review = null;
    this.result = null;
    this.finalStandings = this.standings();
    this.host.setStatus('game_over');
    this.host.changed();
  }

  private assertRoundOpen(): LiveRound {
    if (this.host.getStatus() !== 'in_round' || !this.round || this.round.closing) {
      throw new GameError('ROUND_NOT_ACTIVE', 'No active round.');
    }
    return this.round;
  }

  private assertReviewOpen(): Map<string, LiveReviewEntry> {
    if (this.host.getStatus() !== 'reveal' || !this.review) {
      throw new GameError('NOT_IN_REVEAL', 'Strikes can only be marked after the round closes.');
    }
    if (this.result) {
      throw new GameError('ROUND_ALREADY_CONFIRMED', "This round's strikes are already confirmed.");
    }
    return this.review;
  }

  // ---- snapshots ----

  hostState(selectedPromptIds: string[]): LiveHostState {
    return {
      selectedPromptIds,
      standings: this.standings(),
      phase: this.round?.phase ?? null,
      roundTier: this.round?.tier ?? null,
      hostAnswer: this.round?.hostAnswer ?? null,
      review: this.review ? Array.from(this.review.values()).map((entry) => ({ ...entry })) : null,
      result: this.result,
      finalStandings: this.finalStandings,
    };
  }

  playerState(playerId: string): LivePlayerState {
    const result = this.result
      ? {
          struck: this.result.struckPlayerIds.includes(playerId),
          eliminated: this.result.eliminatedPlayerIds.includes(playerId),
          strikesVoided: this.result.strikesVoided && (this.review?.has(playerId) ?? false),
        }
      : null;
    return {
      strikes: this.strikesFor(playerId),
      maxStrikes: LIVE_MAX_STRIKES,
      phase: this.round?.phase ?? null,
      myAnswer: this.round?.answers.get(playerId) ?? null,
      result: this.review?.has(playerId) ? result : null,
      finalStandings: this.finalStandings,
    };
  }

  /** Public view for the TV display: standings and confirmed results only. */
  displayState() {
    return {
      currentRound: this.roundStartedPayload(),
      phase: this.round?.phase ?? null,
      answeredCount: this.answeredCount(),
      activeCount: this.activeCount(),
      standings: this.standings(),
      result: this.result,
      finalStandings: this.finalStandings,
    };
  }
}
