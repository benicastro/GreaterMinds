import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientEvents, GAME_NAME, LIVE_MODE_NAME, ServerEvents, type DisplayStateSnapshot } from '@greater-minds/shared';
import { socket } from '../../socket';
import { formatWinnerAnnouncement, getWinners } from '../../winnerAnnouncement';
import { Confetti } from '../../components/Confetti';
import { GetReadyScreen } from '../../components/GetReadyScreen';
import { RoomCodeBadge } from '../../components/RoomCodeBadge';
import { TimerBar } from '../../components/TimerBar';
import { LivePhaseBanner } from '../../components/live/LivePhaseBanner';
import { LiveStandingsTable } from '../../components/live/LiveStandingsTable';
import { StrikeBoard } from '../../components/live/StrikeBoard';

const LIVE_SLIDES = ['/title-bg.png'];

/**
 * Read-only shared screen for Live Mode (cast to a TV). Shows the prompt, timer and everyone's
 * strikes — never anyone's answers, and never strikes the host hasn't confirmed yet.
 */
export function DisplayRoom() {
  const { roomCode = '' } = useParams<{ roomCode: string }>();
  const [state, setState] = useState<DisplayStateSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onDisplayState(snapshot: DisplayStateSnapshot) {
      setState(snapshot);
    }
    function watch() {
      socket.emit(
        ClientEvents.DisplayWatch,
        { roomCode },
        (res: { success: boolean; error?: string; displayState?: DisplayStateSnapshot }) => {
          if (res.success && res.displayState) {
            setState(res.displayState);
            setError(null);
          } else {
            setError(res.error ?? 'Could not open this room.');
          }
        },
      );
    }
    socket.on(ServerEvents.RoomDisplayState, onDisplayState);
    // Re-register after any reconnect, since the server forgets display sockets when they drop.
    socket.on('connect', watch);
    if (socket.connected) watch();
    return () => {
      socket.off(ServerEvents.RoomDisplayState, onDisplayState);
      socket.off('connect', watch);
    };
  }, [roomCode]);

  if (!state) {
    return (
      <div className="host-room display-room">
        <h1>{GAME_NAME}</h1>
        <p>{error ?? 'Connecting…'}</p>
      </div>
    );
  }

  if (state.gameMode !== 'live') {
    return (
      <div className="host-room display-room">
        <header>
          <h1>{GAME_NAME}</h1>
          <RoomCodeBadge roomCode={state.roomCode} />
        </header>
        <p>
          The TV display is only used in {LIVE_MODE_NAME}. Switch the room to {LIVE_MODE_NAME} in the host lobby.
        </p>
      </div>
    );
  }

  const round = state.currentRound;
  const joinUrl = `${window.location.host}/join`;

  return (
    <div className="host-room display-room">
      <header>
        <h1>{GAME_NAME}</h1>
        <RoomCodeBadge roomCode={state.roomCode} />
      </header>

      {(state.status === 'lobby' || state.status === 'configuring') && (
        <section className="state-transition">
          <h2>Join the game</h2>
          <p className="display-join">
            Go to <strong>{joinUrl}</strong> and enter code <strong>{state.roomCode}</strong>
          </p>
          <h3>Players ({state.standings.length})</h3>
          <StrikeBoard standings={state.standings} />
        </section>
      )}

      {state.status === 'starting' && (
        <GetReadyScreen
          key={`starting-${state.introSlideIndex ?? 0}`}
          slideIndex={state.introSlideIndex ?? 0}
          slides={LIVE_SLIDES}
          className="state-transition"
        />
      )}

      {state.status === 'in_round' && round && (
        <section key={`round-${round.roundNumber}`} className="state-transition">
          <LivePhaseBanner phase={state.phase} />
          <h2>
            Round {round.roundNumber}: {round.category}
          </h2>
          <p className="display-prompt">{round.promptText}</p>
          <TimerBar endsAt={round.endsAt} durationSeconds={round.durationSeconds} />
          <p>
            {state.answeredCount} / {state.activeCount} answered
          </p>
          <StrikeBoard standings={state.standings} />
        </section>
      )}

      {state.status === 'reveal' && round && (
        <section key={`reveal-${round.roundNumber}-${state.result ? 'done' : 'reading'}`} className="state-transition">
          <h2>{round.category}</h2>
          <p className="prompt-reference">{round.promptText}</p>
          {state.result ? (
            state.result.strikesVoided ? (
              <p className="live-result-note">Everyone left would have been knocked out — no strikes this round!</p>
            ) : (
              <p className="live-result-note">
                {state.result.struckPlayerIds.length === 0
                  ? 'No strikes this round!'
                  : `${state.result.struckPlayerIds.length} ${state.result.struckPlayerIds.length === 1 ? 'strike' : 'strikes'} this round`}
                {state.result.eliminatedPlayerIds.length > 0 &&
                  ` · ${state.result.eliminatedPlayerIds.length} out`}
              </p>
            )
          ) : (
            <p className="display-callout">Hold up your phones and read your answers out loud!</p>
          )}
          <StrikeBoard standings={state.standings} result={state.result} />
        </section>
      )}

      {state.status === 'game_over' && state.finalStandings && (
        <section className="state-transition">
          <Confetti />
          <h2>Final Results</h2>
          <p className="winner-announcement">{formatWinnerAnnouncement(getWinners(state.finalStandings))}</p>
          <LiveStandingsTable standings={state.finalStandings} />
        </section>
      )}
    </div>
  );
}
