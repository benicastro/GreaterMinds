import { useParams } from 'react-router-dom';
import { GAME_NAME } from '@greater-minds/shared';
import { usePlayer } from '../../state/PlayerContext';
import { NicknameForm } from '../../components/NicknameForm';
import { AnswerInput } from '../../components/AnswerInput';
import { RevealCard } from '../../components/RevealCard';
import { AnswerHistogram } from '../../components/AnswerHistogram';
import { TimerBar } from '../../components/TimerBar';
import { LeaderboardTable } from '../../components/LeaderboardTable';
import { Confetti } from '../../components/Confetti';
import { GetReadyScreen } from '../../components/GetReadyScreen';
import { PoweredByFooter } from '../../components/PoweredByFooter';
import { formatWinnerAnnouncement, getWinners } from '../../winnerAnnouncement';

export function PlayerRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { state, joined, joinError, joinRoom, submitAnswer, leaveRoom } = usePlayer();

  if (!joined) {
    return (
      <div className="player-room">
        <h1>{GAME_NAME}</h1>
        <p>Room: {roomCode}</p>
        <NicknameForm onSubmit={(nickname) => joinRoom(roomCode ?? '', nickname)} error={joinError} />
      </div>
    );
  }

  if (!state) return <p>Connecting…</p>;

  return (
    <div className="player-room">
      <header>
        <h1>{state.nickname}</h1>
        <p className="score-display">
          {state.score} pts {state.eliminated && <span className="eliminated-tag">ELIMINATED</span>}
        </p>
      </header>

      {(state.status === 'lobby' || state.status === 'configuring') && (
        <p className="state-transition">Waiting for the host to start the game…</p>
      )}

      {state.status === 'starting' && (
        <GetReadyScreen
          key={`starting-${state.introSlideIndex ?? 0}`}
          slideIndex={state.introSlideIndex ?? 0}
          className="state-transition"
        />
      )}

      {state.status === 'in_round' && state.currentRound && (
        <section key={`round-${state.currentRound.roundNumber}`} className="state-transition">
          <h2>{state.currentRound.category}</h2>
          <p>{state.currentRound.promptText}</p>
          <TimerBar endsAt={state.currentRound.endsAt} durationSeconds={state.currentRound.durationSeconds} />
          {state.eliminated ? (
            <p className="eliminated-banner">You've been eliminated — spectating the rest of the game.</p>
          ) : state.hasAnsweredCurrentRound ? (
            <p>Answer submitted. Waiting for the round to end…</p>
          ) : (
            <AnswerInput onSubmit={submitAnswer} disabled={false} />
          )}
        </section>
      )}

      {state.status === 'reveal' &&
        (state.reveal ? (
          <div key={`reveal-${state.reveal.promptId}`} className="state-transition">
            <h2>{state.reveal.category}</h2>
            <p className="prompt-reference">{state.reveal.promptText}</p>
            <RevealCard entry={state.reveal.entry} />
            <section>
              <h3>What Everyone Picked</h3>
              <AnswerHistogram
                perPlayer={state.reveal.perPlayer}
                hostAnswer={state.reveal.hostAnswer}
                selfPlayerId={state.playerId}
              />
            </section>
          </div>
        ) : (
          <section className="state-transition">
            <p className="eliminated-banner">You've been eliminated — spectating the rest of the game.</p>
          </section>
        ))}

      {state.status === 'game_over' && state.finalLeaderboard && (
        <section className="state-transition">
          <Confetti />
          <h2>Final Results</h2>
          <p className="winner-announcement">
            {formatWinnerAnnouncement(getWinners(state.finalLeaderboard), state.playerId)}
          </p>
          <LeaderboardTable entries={state.finalLeaderboard} />
          <PoweredByFooter />
        </section>
      )}

      <button onClick={leaveRoom} className="leave-room">
        Leave
      </button>
    </div>
  );
}
