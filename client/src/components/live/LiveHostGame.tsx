import {
  LIVE_TIER_LABELS,
  type HostStateSnapshot,
  type LiveHostState,
  type LiveReviewEntry,
  type LiveRoundTier,
} from '@greater-minds/shared';
import { useHost } from '../../state/HostContext';
import { formatWinnerAnnouncement, getWinners } from '../../winnerAnnouncement';
import { AnswerInput } from '../AnswerInput';
import { Confetti } from '../Confetti';
import { PoweredByFooter } from '../PoweredByFooter';
import { TimerBar } from '../TimerBar';
import { LivePhaseBanner } from './LivePhaseBanner';
import { LiveStandingsTable } from './LiveStandingsTable';
import { StrikeBoard } from './StrikeBoard';
import { StrikeMarks } from './StrikeMarks';

/** Groups identical-looking answers next to each other so matches are easy to spot; no-answers last. */
function sortForReview(entries: LiveReviewEntry[]): LiveReviewEntry[] {
  const key = (entry: LiveReviewEntry) => (entry.answer === null ? '￿' : entry.answer.trim().toLowerCase());
  return [...entries].sort((a, b) => key(a).localeCompare(key(b)) || a.nickname.localeCompare(b.nickname));
}

/** Host-only line under the round title: which tier this prompt is from, and why if it isn't the expected one. */
function TierNote({ roundTier }: { roundTier: LiveRoundTier | null }) {
  if (!roundTier) return null; // fixed round order
  if (roundTier.opener) return <p className="live-tier-note">Opening round</p>;
  const tier = LIVE_TIER_LABELS[roundTier.tier];
  if (roundTier.tier === roundTier.wantedTier) {
    return <p className="live-tier-note">{tier} prompt</p>;
  }
  return (
    <p className="live-tier-note">
      <strong>
        {LIVE_TIER_LABELS[roundTier.wantedTier]} prompts used up — playing {tier}
      </strong>
    </p>
  );
}

/** The host's private control panel for an in-progress Live Mode game (everything after the lobby/intro). */
export function LiveHostGame({ state, live }: { state: HostStateSnapshot; live: LiveHostState }) {
  const { submitLiveAnswer, setLiveStrike, confirmLiveRound, nextRound, forceCloseRound } = useHost();
  const activeCount = live.standings.filter((player) => !player.eliminated).length;
  const round = state.currentRound;

  if (state.status === 'in_round' && round) {
    return (
      <section key={`live-round-${round.roundNumber}`} className="state-transition">
        <LivePhaseBanner phase={live.phase} />
        <h2>
          Round {round.roundNumber} / {round.totalRounds}: {round.category}
        </h2>
        <TierNote roundTier={live.roundTier} />
        <p>{round.promptText}</p>
        <TimerBar endsAt={round.endsAt} durationSeconds={round.durationSeconds} />
        <p>
          {state.answeredCount} / {activeCount} answered
        </p>
        {live.phase === 'final_two' &&
          (live.hostAnswer ? (
            <p className="live-host-answer">
              Your answer: <strong>{live.hostAnswer}</strong> (locked in)
            </p>
          ) : (
            <div className="live-host-answer-input">
              <h3>Your answer</h3>
              <p className="prompt-empty-hint">Only you can see this. It locks once you submit.</p>
              <AnswerInput onSubmit={submitLiveAnswer} disabled={false} />
            </div>
          ))}
        <button onClick={forceCloseRound}>Close Round Now</button>
        <StrikeBoard standings={live.standings} />
      </section>
    );
  }

  if (state.status === 'reveal' && live.review) {
    const roundNumber = state.currentRoundNumber ?? 0;
    const struckCount = live.review.filter((entry) => entry.strike).length;

    if (!live.result) {
      return (
        <section key={`live-review-${roundNumber}`} className="state-transition">
          <LivePhaseBanner phase={live.phase} />
          <h2>{round?.category}</h2>
          <p className="prompt-reference">{round?.promptText}</p>
          <p className="prompt-empty-hint">
            Players: hold up your phones and read your answers aloud. Tap a player to give or remove a strike.
            Matching answers are listed next to each other. Nothing is shown to players until you confirm.
          </p>
          {live.phase === 'final_two' && (
            <p className="live-host-answer">
              Your answer: <strong>{live.hostAnswer ?? '(none)'}</strong>
            </p>
          )}
          <ul className="live-review-list">
            {sortForReview(live.review).map((entry) => (
              <li key={entry.playerId}>
                <button
                  type="button"
                  className={entry.strike ? 'live-review-row is-struck' : 'live-review-row'}
                  aria-pressed={entry.strike}
                  onClick={() => setLiveStrike(entry.playerId, !entry.strike)}
                >
                  <span className="live-review-name">
                    {entry.nickname}
                    <StrikeMarks strikes={entry.strikesBefore} />
                  </span>
                  <span className={entry.answer === null ? 'live-review-answer no-answer' : 'live-review-answer'}>
                    {entry.answer ?? 'No answer'}
                  </span>
                  <span className="live-review-verdict">{entry.strike ? '✕ STRIKE' : 'Safe'}</span>
                </button>
              </li>
            ))}
          </ul>
          <button onClick={confirmLiveRound}>
            Confirm Round — {struckCount} {struckCount === 1 ? 'strike' : 'strikes'}
          </button>
        </section>
      );
    }

    const nameOf = (playerId: string) =>
      live.standings.find((player) => player.playerId === playerId)?.nickname ?? 'Unknown';
    const decided = activeCount <= 1 || roundNumber >= state.totalRounds;

    return (
      <section key={`live-result-${roundNumber}`} className="state-transition">
        <h2>Round {roundNumber} Results</h2>
        {live.result.strikesVoided ? (
          <p className="live-result-note">
            Everyone left would have been knocked out — this round's strikes don't count. Play on!
          </p>
        ) : (
          <>
            <p className="live-result-note">
              {live.result.struckPlayerIds.length === 0
                ? 'No strikes this round!'
                : `Strikes: ${live.result.struckPlayerIds.map(nameOf).join(', ')}`}
            </p>
            {live.result.eliminatedPlayerIds.length > 0 && (
              <p className="eliminated-banner">Out: {live.result.eliminatedPlayerIds.map(nameOf).join(', ')}</p>
            )}
          </>
        )}
        <StrikeBoard standings={live.standings} result={live.result} />
        <button onClick={nextRound}>{decided ? 'Show Final Results' : 'Next Round'}</button>
      </section>
    );
  }

  if (state.status === 'game_over' && live.finalStandings) {
    return (
      <section className="state-transition">
        <Confetti />
        <h2>Final Results</h2>
        <p className="winner-announcement">{formatWinnerAnnouncement(getWinners(live.finalStandings))}</p>
        <LiveStandingsTable standings={live.finalStandings} />
        <PoweredByFooter />
      </section>
    );
  }

  return null;
}
