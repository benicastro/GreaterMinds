import { LIVE_MAX_STRIKES } from '@greater-minds/shared';

/** Strike count as filled/empty marks, e.g. ✕✕○ for 2 of 3. */
export function StrikeMarks({ strikes, max = LIVE_MAX_STRIKES }: { strikes: number; max?: number }) {
  return (
    <span className="strike-marks" role="img" aria-label={`${strikes} of ${max} strikes`}>
      {Array.from({ length: max }, (_, index) => (
        <span key={index} className={index < strikes ? 'strike-mark filled' : 'strike-mark'} aria-hidden="true">
          {index < strikes ? '✕' : '○'}
        </span>
      ))}
    </span>
  );
}
