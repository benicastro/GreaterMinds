import type { LivePhase } from '@greater-minds/shared';

export function LivePhaseBanner({ phase }: { phase: LivePhase | null }) {
  if (!phase) return null;
  return phase === 'final_two' ? (
    <p className="live-phase-banner final-two">
      <strong>Final Two</strong> — don't match each other <em>or</em> the host
    </p>
  ) : (
    <p className="live-phase-banner">Don't match anyone else's answer</p>
  );
}
