import type { PlayerSummary } from '@greater-minds/shared';

export function PlayerRosterList({ players, answeredCount }: { players: PlayerSummary[]; answeredCount?: number }) {
  return (
    <div className="player-roster">
      <h3>
        Players ({players.length})
        {answeredCount !== undefined ? ` — ${answeredCount}/${players.length} answered` : ''}
      </h3>
      <ul>
        {players.map((player) => (
          <li key={player.playerId} className={player.connected ? '' : 'disconnected'}>
            {player.nickname} — {player.score} pts {player.connected ? '' : '(disconnected)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
