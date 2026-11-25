import type { PlayerSummary } from '@greater-minds/shared';

export function PlayerRosterList({
  players,
  answeredCount,
  showScore = true,
}: {
  players: PlayerSummary[];
  answeredCount?: number;
  /** Live Mode has strikes, not points, so it hides the score. */
  showScore?: boolean;
}) {
  return (
    <div className="player-roster">
      <h3>
        Players ({players.length})
        {answeredCount !== undefined ? ` — ${answeredCount}/${players.length} answered` : ''}
      </h3>
      <ul>
        {players.map((player) => (
          <li key={player.playerId} className={player.connected ? '' : 'disconnected'}>
            {player.eliminated ? <s>{player.nickname}</s> : player.nickname}
            {showScore && ` — ${player.score} pts`}{' '}
            {player.eliminated && <span className="eliminated-tag">ELIMINATED</span>}
            {!player.eliminated && !player.connected && '(disconnected)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
