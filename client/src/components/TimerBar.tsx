import { useEffect, useState } from 'react';

export function TimerBar({ endsAt, durationSeconds }: { endsAt: number; durationSeconds: number }) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, endsAt - Date.now()));

  useEffect(() => {
    setRemainingMs(Math.max(0, endsAt - Date.now()));
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, endsAt - Date.now()));
    }, 100);
    return () => clearInterval(interval);
  }, [endsAt]);

  const totalMs = Math.max(1, durationSeconds * 1000);
  const fraction = Math.min(1, Math.max(0, remainingMs / totalMs));
  const seconds = Math.ceil(remainingMs / 1000);

  const urgency = fraction > 0.5 ? 'timer-calm' : fraction > 0.2 ? 'timer-warn' : 'timer-danger';

  return (
    <div className={`timer-bar ${urgency}`}>
      <div className="timer-bar-track">
        <div className="timer-bar-fill" style={{ transform: `scaleX(${fraction})` }} />
      </div>
      <span className="timer-bar-seconds">{seconds}s</span>
    </div>
  );
}
