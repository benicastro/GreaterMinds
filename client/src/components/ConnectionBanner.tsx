import { useEffect, useState } from 'react';
import { socket } from '../socket';

// Wait this long after a drop before showing the banner, so brief network blips don't flicker it.
const SHOW_DELAY_MS = 1000;

/**
 * Fixed "Reconnecting…" strip shown while the socket is down after having been connected once.
 * The initial connection is left to each screen's own "Connecting…" text. Socket.IO retries on
 * its own; the player/host contexts re-attach to their seat on every `connect`.
 */
export function ConnectionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    function clearTimer() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    }
    function onDisconnect() {
      clearTimer();
      timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }
    function onConnect() {
      clearTimer();
      setVisible(false);
    }
    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);
    return () => {
      clearTimer();
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, []);

  if (!visible) return null;
  return (
    <div className="connection-banner" role="status" aria-live="polite">
      Reconnecting…
    </div>
  );
}
