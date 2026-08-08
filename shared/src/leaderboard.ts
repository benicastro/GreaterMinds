import { LeaderboardEntry } from './types.js';

export interface ScoredPlayer {
  playerId: string;
  nickname: string;
  score: number;
  eliminated: boolean;
}

/**
 * Standard competition ranking ("1224"): players tied on score share the same rank,
 * and the next distinct score's rank skips ahead by the number of players tied above it.
 */
export function computeLeaderboard(players: ScoredPlayer[]): LeaderboardEntry[] {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const result: LeaderboardEntry[] = [];
  let rank = 0;
  let previousScore: number | null = null;

  sorted.forEach((player, index) => {
    if (previousScore === null || player.score !== previousScore) {
      rank = index + 1;
      previousScore = player.score;
    }
    result.push({
      playerId: player.playerId,
      nickname: player.nickname,
      score: player.score,
      rank,
      eliminated: player.eliminated,
    });
  });

  return result;
}
