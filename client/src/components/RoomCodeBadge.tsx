export function RoomCodeBadge({ roomCode }: { roomCode: string }) {
  return (
    <div className="room-code-badge">
      <span className="label">Room Code</span>
      <span className="code">{roomCode}</span>
    </div>
  );
}
