export type OutcomeBucket = 'unique' | 'player-match' | 'host-match' | 'invalid' | 'timeout';

export interface ValidationResult {
  valid: boolean;
  /** Canonical display-form answer used as the collision-matching key. Present iff valid. */
  canonicalAnswer?: string;
}

export interface PromptDefinition {
  /** Stable slug, e.g. "rainbow-color". Never change once games may reference it. */
  id: string;
  /** Short category label, e.g. "Rainbow Color". */
  category: string;
  /** The question shown to players, e.g. "Name a color of the rainbow." */
  promptText: string;
  /** Display-form canonical answers, e.g. ["Red", "Orange", ...]. */
  canonicalAnswers: string[];
  /** Raw (un-normalized) alias -> canonical answer, many-to-one. */
  aliases?: Record<string, string>;
  /** Raw (un-normalized) values that must always be rejected, even if they'd otherwise match. */
  rejections?: string[];
  /** Predetermined "host" answer for this prompt. Must be one of canonicalAnswers. */
  hostAnswer: string;
  /** Optional override for prompts that need bespoke parsing (currently only the 1-10 number prompt). */
  validate?: (raw: string) => ValidationResult;
}

export type RoomStatus = 'lobby' | 'configuring' | 'starting' | 'in_round' | 'reveal' | 'game_over';

export interface PlayerSummary {
  playerId: string;
  nickname: string;
  connected: boolean;
  score: number;
  /** Hard elimination: true once their score has dropped below 0. They no longer answer rounds. */
  eliminated: boolean;
}

export interface RoundStartedPayload {
  promptId: string;
  category: string;
  promptText: string;
  endsAt: number;
  durationSeconds: number;
  roundNumber: number;
  totalRounds: number;
}

export interface RevealEntry {
  playerId: string;
  nickname: string;
  rawAnswer: string | null;
  canonicalAnswer: string | null;
  outcome: OutcomeBucket;
  scoreDelta: number;
  message: string;
  newScore: number;
  /** True if this round's outcome is what dropped them below 0 (hard elimination). */
  eliminated: boolean;
}

export interface RevealPayload {
  promptId: string;
  category: string;
  promptText: string;
  hostAnswer: string;
  /** Every player's outcome this round — safe to share with everyone once the round is scored. */
  perPlayer: RevealEntry[];
}

export interface PlayerRevealPayload extends RevealPayload {
  /** Convenience pointer to this player's own entry within perPlayer. */
  entry: RevealEntry;
}

export interface LeaderboardEntry {
  playerId: string;
  nickname: string;
  score: number;
  rank: number;
  eliminated: boolean;
}

export interface HostStateSnapshot {
  roomCode: string;
  status: RoomStatus;
  players: PlayerSummary[];
  selectedPromptIds: string[];
  timerDurationSeconds: number;
  currentRoundNumber: number | null;
  totalRounds: number;
  currentRound: RoundStartedPayload | null;
  answeredCount: number;
  reveal: RevealPayload | null;
  finalLeaderboard: LeaderboardEntry[] | null;
  /** Which intro slide is showing, while status is 'starting'. Null otherwise. */
  introSlideIndex: number | null;
}

export interface PlayerStateSnapshot {
  roomCode: string;
  playerId: string;
  nickname: string;
  status: RoomStatus;
  score: number;
  eliminated: boolean;
  currentRound: RoundStartedPayload | null;
  hasAnsweredCurrentRound: boolean;
  reveal: PlayerRevealPayload | null;
  finalLeaderboard: LeaderboardEntry[] | null;
  /** Which intro slide is showing, while status is 'starting'. Null otherwise. */
  introSlideIndex: number | null;
}

export interface ActionError {
  code: string;
  message: string;
}
