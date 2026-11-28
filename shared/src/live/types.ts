import type { RoomStatus, RoundStartedPayload } from '../types.js';
import type { LiveTier } from './prompts.js';

/**
 * Which rule set a room plays. 'classic' is the original virtual game (scores, auto-validated
 * answers). 'live' is the in-person mode, shown to people as "Three Strikes": players answer on
 * their phones, read their answers aloud, and the host hands out strikes by hand — three strikes
 * and you're out.
 */
export type GameMode = 'classic' | 'live';

/**
 * 'group' — three or more players left; avoid matching each other.
 * 'final_two' — exactly two left; avoid matching each other AND the host's answer.
 * Fixed per round at the moment the round starts.
 */
export type LivePhase = 'group' | 'final_two';

export const LIVE_MAX_STRIKES = 3;

/** Shown wherever players or the host see the mode's name. Code keeps calling it "live". */
export const LIVE_MODE_NAME = 'Three Strikes';

/** Adaptive round order only: where this round's prompt came from. Host-only. */
export interface LiveRoundTier {
  tier: LiveTier;
  /** The tier the player count called for; differs from `tier` when that tier was used up. */
  wantedTier: LiveTier;
}

export interface LiveStanding {
  playerId: string;
  nickname: string;
  connected: boolean;
  strikes: number;
  eliminated: boolean;
  /** Round number in which they reached three strikes, or null while still in. */
  eliminatedInRound: number | null;
}

export interface LiveRankedStanding extends LiveStanding {
  rank: number;
}

/** One row of the host's strike-marking list during a live reveal. Host-only — never sent to players or the display. */
export interface LiveReviewEntry {
  playerId: string;
  nickname: string;
  /** What they typed, or null if they didn't answer in time. */
  answer: string | null;
  /** Strikes they had going into this round. */
  strikesBefore: number;
  /** Whether the host currently has a strike marked for them (pre-marked for no answer). */
  strike: boolean;
}

/** The outcome of a confirmed live round. Safe to share with everyone. */
export interface LiveRoundResult {
  struckPlayerIds: string[];
  eliminatedPlayerIds: string[];
  /** True if every remaining player would have been eliminated, so the round's strikes were thrown out. */
  strikesVoided: boolean;
}

export interface LiveHostState {
  /** Prompt order the host picked in the lobby. */
  selectedPromptIds: string[];
  standings: LiveRankedStanding[];
  /** Current/most recent round's phase, null before round 1. */
  phase: LivePhase | null;
  /** Current/most recent round's tier in adaptive order; null in fixed order or before round 1. */
  roundTier: LiveRoundTier | null;
  /** Host's own answer this round (final two only), null until typed. */
  hostAnswer: string | null;
  /** Strike-marking list, present during a reveal. */
  review: LiveReviewEntry[] | null;
  /** Present once the host confirms the round's strikes. */
  result: LiveRoundResult | null;
  finalStandings: LiveRankedStanding[] | null;
}

export interface LivePlayerState {
  strikes: number;
  maxStrikes: number;
  phase: LivePhase | null;
  /** This player's own answer for the current round (null if none yet / none given). */
  myAnswer: string | null;
  /** Present once the host confirms the round's strikes. */
  result: { struck: boolean; eliminated: boolean; strikesVoided: boolean } | null;
  finalStandings: LiveRankedStanding[] | null;
}

/** What the optional shared TV display receives. Never contains anyone's answers or unconfirmed strikes. */
export interface DisplayStateSnapshot {
  roomCode: string;
  status: RoomStatus;
  gameMode: GameMode;
  introSlideIndex: number | null;
  currentRound: RoundStartedPayload | null;
  phase: LivePhase | null;
  answeredCount: number;
  activeCount: number;
  standings: LiveRankedStanding[];
  /** Present after the host confirms a round, until the next round starts. */
  result: LiveRoundResult | null;
  finalStandings: LiveRankedStanding[] | null;
}
