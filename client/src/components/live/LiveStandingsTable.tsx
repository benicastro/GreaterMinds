import type { LiveRankedStanding } from '@greater-minds/shared';
import { StrikeMarks } from './StrikeMarks';

export function LiveStandingsTable({ standings }: { standings: LiveRankedStanding[] }) {
  return (
    <div className="table-scroll">
      <table className="leaderboard">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Strikes</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry) => (
            <tr
              key={entry.playerId}
              className={entry.rank === 1 ? 'winner-row' : entry.eliminated ? 'eliminated-row' : undefined}
            >
              <td>{entry.rank === 1 ? '🏆' : entry.rank}</td>
              <td>
                {entry.eliminated ? <s>{entry.nickname}</s> : entry.nickname}
                {entry.eliminated && (
                  <span className="eliminated-tag">OUT · ROUND {entry.eliminatedInRound}</span>
                )}
              </td>
              <td>
                <StrikeMarks strikes={entry.strikes} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
