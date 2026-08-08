import { useParams } from 'react-router-dom';
import { HostProvider } from '../../state/HostContext';
import { HostRoom } from './HostRoom';

export function HostRoomRoute() {
  const { roomCode } = useParams<{ roomCode: string }>();
  if (!roomCode) return null;
  return (
    <HostProvider roomCodeFromRoute={roomCode}>
      <HostRoom />
    </HostProvider>
  );
}
