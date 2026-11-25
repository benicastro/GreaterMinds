import type { LivePlayerState, PlayerStateSnapshot } from '@greater-minds/shared';
import { formatWinnerAnnouncement, getWinners } from '../../winnerAnnouncement';
import { AnswerInput } from '../AnswerInput';
import { Confetti } from '../Confetti';
import { PoweredByFooter } from '../PoweredByFooter';
import { TimerBar } from '../TimerBar';
import { LivePhaseBanner } from './LivePhaseBanner';
import { LiveStandingsTable } from './LiveStandingsTable';

/** A player's phone during a Live Mode game (everything after the lobby/intro). */
export function LivePlayerGame({
  state,
  live,
  onSubmitAnswer,
}: {
  state: PlayerStateSnapshot;
  live: LivePlayerState;
  onSubmitAnswer: (answer: string) => void;
}) {
  const round = state.currentRound;

  if (state.status === 'in_round' && round) {
    return (
      <section key={`live-round-${round.roundNumber}`} className="state-transition">
        {!state.eliminated && <LivePhaseBanner phase={live.phase} />}
        <h2>{round.category}</h2>
        <p>{round.promptText}</p>
        <TimerBar endsAt={round.endsAt} durationSeconds={round.durationSeconds} />
        {state.eliminated ? (
          <p className="eliminated-banner">You're out — enjoy the rest of the game!</p>
        ) : state.hasAnsweredCurrentRound ? (
          <p>
            Locked in: <strong>{live.myAnswer}</strong>. Waiting for the round to end…
          </p>
        ) : (
          <AnswerInput onSubmit={onSubmitAnswer} disabled={false} />
        )}
      </section>
    );
  }

  if (state.status === 'reveal') {
    const roundNumber = round?.roundNumber ?? 0;
    // Eliminated before this round: nothing to show them but a spectator note.
    if (state.eliminated && !live.result?.eliminated) {
      return (
        <section key={`live-spectate-${roundNumber}`} className="state-transition">
          <p className="eliminated-banner">You're out — listen in as everyone reads their answers!</p>
        </section>
      );
    }

    if (!live.result) {
      return (
        <section key={`live-flash-${roundNumber}`} className="state-transition live-flash">
          <p className="live-flash-hint">Hold up your phone and read your answer out loud!</p>
          <p className={live.myAnswer ? 'live-flash-answer' : 'live-flash-answer no-answer'}>
            {live.myAnswer ?? 'No answer'}
          </p>
          {!live.myAnswer && <p className="prompt-empty-hint">No answer counts as a strike.</p>}
          <p className="live-flash-wait">Waiting for the host to call strikes…</p>
        </section>
      );
    }

    const { struck, eliminated, strikesVoided } = live.result;
    return (
      <section key={`live-verdict-${roundNumber}`} className="state-transition">
        {strikesVoided ? (
          <div className="live-verdict voided">
            <p className="live-verdict-title">Saved!</p>
            <p>Everyone left would have been knocked out, so this round's strikes don't count.</p>
          </div>
        ) : eliminated ? (
          <div className="live-verdict out">
            <p className="live-verdict-title">☠️ Strike three — you're out!</p>
            <p>Stick around and watch who wins.</p>
          </div>
        ) : struck ? (
          <div className="live-verdict struck">
            <p className="live-verdict-title">✕ Strike!</p>
            <p>
              {live.maxStrikes - live.strikes} {live.maxStrikes - live.strikes === 1 ? 'life' : 'lives'} left.
            </p>
          </div>
        ) : (
          <div className="live-verdict safe">
            <p className="live-verdict-title">✓ Safe!</p>
            <p>No strike this round.</p>
          </div>
        )}
      </section>
    );
  }

  if (state.status === 'game_over' && live.finalStandings) {
    return (
      <section className="state-transition">
        <Confetti />
        <h2>Final Results</h2>
        <p className="winner-announcement">
          {formatWinnerAnnouncement(getWinners(live.finalStandings), state.playerId)}
        </p>
        <LiveStandingsTable standings={live.finalStandings} />
        <PoweredByFooter />
      </section>
    );
  }

  return null;
}
