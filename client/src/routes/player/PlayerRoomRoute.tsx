import { useParams } from 'react-router-dom';
import { ConnectionBanner } from '../../components/ConnectionBanner';
import { PlayerProvider } from '../../state/PlayerContext';
import { PlayerRoom } from './PlayerRoom';

export function PlayerRoomRoute() {
  const { roomCode } = useParams<{ roomCode: string }>();
  if (!roomCode) return null;
  return (
    <PlayerProvider roomCode={roomCode}>
      <ConnectionBanner />
      <PlayerRoom />
    </PlayerProvider>
  );
}
