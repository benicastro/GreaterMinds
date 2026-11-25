/** Anything ranked: Classic's leaderboard entries and Live Mode's strike standings both fit. */
interface RankedEntry {
  playerId: string;
  nickname: string;
  rank: number;
}

export function getWinners<T extends RankedEntry>(leaderboard: T[]): T[] {
  return leaderboard.filter((entry) => entry.rank === 1);
}

/**
 * Formats the game-over banner text, crediting every player tied for first place.
 * Pass the viewer's own playerId to personalize it as "You" when they're among the winners.
 */
export function formatWinnerAnnouncement(winners: RankedEntry[], selfPlayerId?: string): string {
  if (winners.length === 0) return '';

  const label = (winner: RankedEntry) => (winner.playerId === selfPlayerId ? 'You' : winner.nickname);

  if (winners.length > 1) {
    return `🏆 It's a tie! ${winners.map(label).join(' & ')} win!`;
  }

  const name = label(winners[0]);
  return name === 'You' ? '🏆 You win!' : `🏆 ${name} wins!`;
}
