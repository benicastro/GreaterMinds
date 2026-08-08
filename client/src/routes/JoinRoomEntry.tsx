import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function JoinRoomEntry() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = roomCode.trim().toUpperCase();
    if (!trimmed) return;
    navigate(`/play/${trimmed}`);
  }

  return (
    <div className="join-room-entry">
      <h2>Join a Game</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value)}
          placeholder="Room Code"
          maxLength={4}
          autoFocus
        />
        <button type="submit" disabled={!roomCode.trim()}>
          Continue
        </button>
      </form>
    </div>
  );
}
