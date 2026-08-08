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
        <p className="score-display">{state.score} pts</p>
      </header>

      {(state.status === 'lobby' || state.status === 'configuring') && <p>Waiting for the host to start the game…</p>}

      {state.status === 'starting' && <GetReadyScreen slideIndex={state.introSlideIndex ?? 0} />}

      {state.status === 'in_round' && state.currentRound && (
        <section>
          <h2>{state.currentRound.category}</h2>
          <p>{state.currentRound.promptText}</p>
          <TimerBar endsAt={state.currentRound.endsAt} durationSeconds={state.currentRound.durationSeconds} />
          {state.hasAnsweredCurrentRound ? (
            <p>Answer submitted. Waiting for the round to end…</p>
          ) : (
            <AnswerInput onSubmit={submitAnswer} disabled={false} />
          )}
        </section>
      )}

      {state.status === 'reveal' && state.reveal && (
        <>
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
        </>
      )}

      {state.status === 'game_over' && state.finalLeaderboard && (
        <section>
          <Confetti />
          <h2>Final Results</h2>
          <p className="winner-announcement">
            {formatWinnerAnnouncement(getWinners(state.finalLeaderboard), state.playerId)}
          </p>
          <LeaderboardTable entries={state.finalLeaderboard} />
        </section>
      )}

      <button onClick={leaveRoom} className="leave-room">
        Leave
      </button>
    </div>
  );
}
