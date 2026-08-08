import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostProvider, useHost } from '../../state/HostContext';

function HostNewInner() {
  const { roomCode, createRoom } = useHost();
  const navigate = useNavigate();
  const hasRequestedRoom = useRef(false);

  useEffect(() => {
    // Guard against StrictMode's dev-only double-invoke, which would otherwise
    // create two separate rooms and leave sessionStorage pointing at the wrong one.
    if (hasRequestedRoom.current) return;
    hasRequestedRoom.current = true;
    createRoom();
  }, [createRoom]);

  useEffect(() => {
    if (roomCode) navigate(`/host/${roomCode}`, { replace: true });
  }, [roomCode, navigate]);

  return <p>Creating room…</p>;
}

export function HostNew() {
  return (
    <HostProvider>
      <HostNewInner />
    </HostProvider>
  );
}
