import type { RevealEntry } from '@greater-minds/shared';
import { OUTCOME_ICON } from '../outcomeMeta';

export function RevealCard({ entry }: { entry: RevealEntry }) {
  const showCanonical = entry.canonicalAnswer !== null && entry.canonicalAnswer !== entry.rawAnswer;
  const deltaLabel = entry.scoreDelta > 0 ? `+${entry.scoreDelta}` : `${entry.scoreDelta}`;

  return (
    <div className={`reveal-card outcome-${entry.outcome}`}>
      <div className="reveal-headline">
        <span className="reveal-icon" aria-hidden="true">
          {OUTCOME_ICON[entry.outcome]}
        </span>
        <p className="reveal-message">{entry.message}</p>
        <span className="reveal-delta-badge">{deltaLabel}</span>
      </div>
      <p className="reveal-answer">
        You answered <strong>{entry.rawAnswer ?? '(no answer)'}</strong>
        {showCanonical && (
          <>
            {' '}
            — counted as <strong>{entry.canonicalAnswer}</strong>
          </>
        )}
      </p>
      {entry.eliminated && (
        <p className="eliminated-banner">☠️ Your score dropped below 0 — you're eliminated. You can keep watching!</p>
      )}
    </div>
  );
}
