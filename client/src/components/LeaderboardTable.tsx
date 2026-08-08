import type { LeaderboardEntry } from '@greater-minds/shared';

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <table className="leaderboard">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.playerId} className={entry.rank === 1 ? 'winner-row' : undefined}>
            <td>{entry.rank === 1 ? '🏆' : entry.rank}</td>
            <td>{entry.nickname}</td>
            <td>{entry.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
