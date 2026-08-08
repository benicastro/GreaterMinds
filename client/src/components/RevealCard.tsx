import type { RevealEntry } from '@greater-minds/shared';
import { OUTCOME_ICON } from '../outcomeMeta';

export function RevealCard({ entry, hostAnswer }: { entry: RevealEntry; hostAnswer: string }) {
  return (
    <div className={`reveal-card outcome-${entry.outcome}`}>
      <p className="reveal-message">
        <span className="reveal-icon">{OUTCOME_ICON[entry.outcome]}</span>
        {entry.message}
      </p>
      <p>
        Your answer: <strong>{entry.rawAnswer ?? '(no answer)'}</strong>
      </p>
      {entry.canonicalAnswer && <p>Counted as: {entry.canonicalAnswer}</p>}
      <p>Host's answer: {hostAnswer}</p>
      <p>Score change: {entry.scoreDelta >= 0 ? `+${entry.scoreDelta}` : entry.scoreDelta}</p>
      <p>New score: {entry.newScore}</p>
    </div>
  );
}
