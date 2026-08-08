import { Link } from 'react-router-dom';
import { GAME_NAME } from '@greater-minds/shared';
import { useHost } from '../../state/HostContext';
import { RoomCodeBadge } from '../../components/RoomCodeBadge';
import { PlayerRosterList } from '../../components/PlayerRosterList';
import { PromptPicker } from '../../components/PromptPicker';
import { TimerBar } from '../../components/TimerBar';
import { LeaderboardTable } from '../../components/LeaderboardTable';
import { AnswerHistogram } from '../../components/AnswerHistogram';
import { Confetti } from '../../components/Confetti';
import { GetReadyScreen } from '../../components/GetReadyScreen';
import { OUTCOME_ICON } from '../../outcomeMeta';
import { formatWinnerAnnouncement, getWinners } from '../../winnerAnnouncement';

export function HostRoom() {
  const {
    roomCode,
    state,
    error,
    updatePromptSelection,
    updateTimerConfig,
    startGame,
    advanceIntro,
    nextRound,
    forceCloseRound,
    endGame,
  } = useHost();

  if (!roomCode || !state) {
    return (
      <div className="host-room">
        <p>Connecting…</p>
        {error && (
          <>
            <p className="error">{error}</p>
            <Link to="/host/new">Start a new game</Link>
          </>
        )}
      </div>
    );
  }

  const isLastRound = state.currentRoundNumber !== null && state.currentRoundNumber >= state.totalRounds;

  return (
    <div className="host-room">
      <header>
        <h1>{GAME_NAME}</h1>
        <RoomCodeBadge roomCode={roomCode} />
      </header>

      {error && <p className="error">{error}</p>}

      {(state.status === 'lobby' || state.status === 'configuring') && (
        <section>
          <PlayerRosterList players={state.players} />
          <PromptPicker selectedIds={state.selectedPromptIds} onChange={updatePromptSelection} />
          <label className="timer-config">
            Timer (seconds):
            <input
              type="number"
              min={5}
              max={120}
              value={state.timerDurationSeconds}
              onChange={(event) => updateTimerConfig(Number(event.target.value))}
            />
          </label>
          <button onClick={startGame} disabled={state.selectedPromptIds.length === 0}>
            Start Game
          </button>
        </section>
      )}

      {state.status === 'starting' && (
        <GetReadyScreen slideIndex={state.introSlideIndex ?? 0} onAdvance={advanceIntro} />
      )}

      {state.status === 'in_round' && state.currentRound && (
        <section>
          <h2>
            Round {state.currentRound.roundNumber} / {state.currentRound.totalRounds}: {state.currentRound.category}
          </h2>
          <p>{state.currentRound.promptText}</p>
          <TimerBar endsAt={state.currentRound.endsAt} durationSeconds={state.currentRound.durationSeconds} />
          <p>
            {state.answeredCount} / {state.players.length} answered
          </p>
          <button onClick={forceCloseRound}>Force Close Round</button>
        </section>
      )}

      {state.status === 'reveal' && state.reveal && (
        <section>
          <h2>{state.reveal.category}</h2>
          <p className="prompt-reference">{state.reveal.promptText}</p>
          <AnswerHistogram perPlayer={state.reveal.perPlayer} hostAnswer={state.reveal.hostAnswer} />
          <table className="reveal-grid">
            <thead>
              <tr>
                <th></th>
                <th>Player</th>
                <th>Answer</th>
                <th>Result</th>
                <th>Δ</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {state.reveal.perPlayer.map((entry) => (
                <tr key={entry.playerId} className={`outcome-${entry.outcome}`}>
                  <td className="outcome-icon">{OUTCOME_ICON[entry.outcome]}</td>
                  <td>{entry.nickname}</td>
                  <td>{entry.rawAnswer ?? '(none)'}</td>
                  <td>{entry.message}</td>
                  <td>{entry.scoreDelta}</td>
                  <td>{entry.newScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={nextRound}>{isLastRound ? 'Show Final Results' : 'Next Round'}</button>
        </section>
      )}

      {state.status === 'game_over' && state.finalLeaderboard && (
        <section>
          <Confetti />
          <h2>Final Results</h2>
          <p className="winner-announcement">{formatWinnerAnnouncement(getWinners(state.finalLeaderboard))}</p>
          <LeaderboardTable entries={state.finalLeaderboard} />
        </section>
      )}

      {state.status !== 'game_over' && (
        <button onClick={endGame} className="end-game">
          End Game
        </button>
      )}
    </div>
  );
}
