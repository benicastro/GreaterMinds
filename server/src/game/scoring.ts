import { OutcomeBucket } from '@greater-minds/shared';

export interface SubmissionRecord {
  raw: string;
  canonicalAnswer: string | null;
}

export interface RoundOutcome {
  outcome: OutcomeBucket;
  scoreDelta: number;
  canonicalAnswer: string | null;
  rawAnswer: string | null;
}

const SCORE_DELTA: Record<OutcomeBucket, number> = {
  unique: 0,
  'player-match': -1,
  'host-match': -2,
  invalid: -2,
  timeout: -2,
};

/**
 * Classifies every player's round outcome per the design doc's priority rule:
 * penalties never stack, and a host-match takes priority over a player-match
 * when an answer happens to hit both.
 */
export function scoreRound(
  hostAnswer: string,
  allPlayerIds: string[],
  submissions: Map<string, SubmissionRecord>,
): Map<string, RoundOutcome> {
  const result = new Map<string, RoundOutcome>();
  const canonicalCounts = new Map<string, number>();

  for (const playerId of allPlayerIds) {
    const sub = submissions.get(playerId);

    if (!sub) {
      result.set(playerId, { outcome: 'timeout', scoreDelta: SCORE_DELTA.timeout, canonicalAnswer: null, rawAnswer: null });
      continue;
    }
    if (sub.canonicalAnswer === null) {
      result.set(playerId, { outcome: 'invalid', scoreDelta: SCORE_DELTA.invalid, canonicalAnswer: null, rawAnswer: sub.raw });
      continue;
    }
    if (sub.canonicalAnswer === hostAnswer) {
      result.set(playerId, {
        outcome: 'host-match',
        scoreDelta: SCORE_DELTA['host-match'],
        canonicalAnswer: sub.canonicalAnswer,
        rawAnswer: sub.raw,
      });
      continue;
    }

    canonicalCounts.set(sub.canonicalAnswer, (canonicalCounts.get(sub.canonicalAnswer) ?? 0) + 1);
  }

  for (const playerId of allPlayerIds) {
    if (result.has(playerId)) continue;
    const sub = submissions.get(playerId)!;
    const canonicalAnswer = sub.canonicalAnswer!;
    const count = canonicalCounts.get(canonicalAnswer) ?? 0;

    result.set(
      playerId,
      count >= 2
        ? { outcome: 'player-match', scoreDelta: SCORE_DELTA['player-match'], canonicalAnswer, rawAnswer: sub.raw }
        : { outcome: 'unique', scoreDelta: SCORE_DELTA.unique, canonicalAnswer, rawAnswer: sub.raw },
    );
  }

  return result;
}
