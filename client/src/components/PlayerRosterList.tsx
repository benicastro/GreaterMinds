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
            {player.eliminated ? <s>{player.nickname}</s> : player.nickname} — {player.score} pts{' '}
            {player.eliminated && <span className="eliminated-tag">ELIMINATED</span>}
            {!player.eliminated && !player.connected && '(disconnected)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
