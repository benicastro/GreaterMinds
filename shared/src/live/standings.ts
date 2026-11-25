import type { LiveRankedStanding, LiveStanding } from './types.js';

/**
 * Orders Live Mode players best-first and assigns standard competition ranks ("1224"):
 * - Players still in rank above everyone eliminated, fewer strikes first.
 * - Eliminated players rank by how long they lasted (eliminated later = higher).
 * Players tie when they're both still in with the same strikes, or were eliminated in the same round.
 */
export function computeLiveStandings(players: LiveStanding[]): LiveRankedStanding[] {
  const sortKey = (player: LiveStanding): number =>
    player.eliminated ? 1_000_000 - (player.eliminatedInRound ?? 0) : player.strikes;

  const sorted = [...players].sort((a, b) => sortKey(a) - sortKey(b));
  let rank = 0;
  let previousKey: number | null = null;
  return sorted.map((player, index) => {
    const key = sortKey(player);
    if (key !== previousKey) {
      rank = index + 1;
      previousKey = key;
    }
    return { ...player, rank };
  });
}
