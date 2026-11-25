import type { LiveRankedStanding, LiveRoundResult } from '@greater-minds/shared';
import { StrikeMarks } from './StrikeMarks';

/**
 * Grid of every player's strike count — the main thing the room watches in Live Mode. Built to
 * stay readable with ~20 players. Highlights who was struck / knocked out in the last confirmed
 * round when `result` is given.
 */
export function StrikeBoard({
  standings,
  result,
  selfPlayerId,
}: {
  standings: LiveRankedStanding[];
  result?: LiveRoundResult | null;
  selfPlayerId?: string;
}) {
  const struck = new Set(result?.struckPlayerIds ?? []);
  const knockedOut = new Set(result?.eliminatedPlayerIds ?? []);

  return (
    <ul className="strike-board">
      {standings.map((player) => {
        const classes = ['strike-card'];
        if (player.eliminated) classes.push('is-out');
        if (struck.has(player.playerId)) classes.push('just-struck');
        if (knockedOut.has(player.playerId)) classes.push('just-out');
        if (player.playerId === selfPlayerId) classes.push('is-self');
        return (
          <li key={player.playerId} className={classes.join(' ')}>
            <span className="strike-card-name">{player.nickname}</span>
            {player.eliminated ? (
              <span className="eliminated-tag">OUT</span>
            ) : (
              <StrikeMarks strikes={player.strikes} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
