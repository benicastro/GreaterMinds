import type { LeaderboardEntry } from '@greater-minds/shared';

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="table-scroll">
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
            <tr
              key={entry.playerId}
              className={entry.rank === 1 ? 'winner-row' : entry.eliminated ? 'eliminated-row' : undefined}
            >
              <td>{entry.rank === 1 ? '🏆' : entry.rank}</td>
              <td>
                {entry.eliminated ? <s>{entry.nickname}</s> : entry.nickname}
                {entry.eliminated && <span className="eliminated-tag">ELIMINATED</span>}
              </td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
