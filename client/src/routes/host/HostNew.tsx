import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostProvider, useHost } from '../../state/HostContext';

function HostNewInner() {
  const { roomCode, error, createRoom } = useHost();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    if (roomCode) navigate(`/host/${roomCode}`, { replace: true });
  }, [roomCode, navigate]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createRoom(passcode);
  }

  return (
    <div className="host-new">
      <h1>Host a Game</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Host passcode"
          autoFocus
        />
        <button type="submit">Create Room</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export function HostNew() {
  return (
    <HostProvider>
      <HostNewInner />
    </HostProvider>
  );
}
