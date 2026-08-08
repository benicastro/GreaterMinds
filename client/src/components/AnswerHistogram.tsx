import type { OutcomeBucket, RevealEntry } from '@greater-minds/shared';
import { OUTCOME_ICON } from '../outcomeMeta';

interface AnswerGroup {
  key: string;
  label: string;
  outcome: OutcomeBucket;
  players: RevealEntry[];
}

function groupRevealEntries(perPlayer: RevealEntry[]): AnswerGroup[] {
  const canonicalGroups = new Map<string, RevealEntry[]>();
  const invalid: RevealEntry[] = [];
  const timeout: RevealEntry[] = [];

  for (const entry of perPlayer) {
    if (entry.outcome === 'invalid') {
      invalid.push(entry);
      continue;
    }
    if (entry.outcome === 'timeout') {
      timeout.push(entry);
      continue;
    }
    // unique / player-match / host-match all carry a canonicalAnswer, and every
    // player sharing one always shares the same outcome (scoring groups by it too).
    const key = entry.canonicalAnswer ?? entry.rawAnswer ?? 'Unknown';
    if (!canonicalGroups.has(key)) canonicalGroups.set(key, []);
    canonicalGroups.get(key)!.push(entry);
  }

  const groups: AnswerGroup[] = Array.from(canonicalGroups.entries()).map(([key, players]) => ({
    key,
    label: key,
    outcome: players[0].outcome,
    players,
  }));

  groups.sort((a, b) => b.players.length - a.players.length);

  if (invalid.length > 0) {
    groups.push({ key: '__invalid__', label: 'Invalid answers', outcome: 'invalid', players: invalid });
  }
  if (timeout.length > 0) {
    groups.push({ key: '__timeout__', label: 'No answer', outcome: 'timeout', players: timeout });
  }

  return groups;
}

function formatPlayerLabel(entry: RevealEntry, selfPlayerId: string | undefined, includeRaw: boolean): string {
  const name = entry.playerId === selfPlayerId ? `${entry.nickname} (you)` : entry.nickname;
  return includeRaw ? `${name}: ${entry.rawAnswer ?? '—'}` : name;
}

export function AnswerHistogram({
  perPlayer,
  hostAnswer,
  selfPlayerId,
}: {
  perPlayer: RevealEntry[];
  hostAnswer: string;
  selfPlayerId?: string;
}) {
  const groups = groupRevealEntries(perPlayer);
  const totalPlayers = perPlayer.length;

  return (
    <div className="answer-histogram-wrapper">
      <p className="histogram-host-caption">
        <span aria-hidden="true">🎯</span> Host's Answer: <strong>{hostAnswer}</strong>
      </p>
      <ul className="answer-histogram" aria-label={`Answers this round, grouped into ${groups.length} distinct results`}>
        {groups.map((group) => {
          const fraction = totalPlayers > 0 ? group.players.length / totalPlayers : 0;
          const names = group.players
            .map((entry) => formatPlayerLabel(entry, selfPlayerId, group.key === '__invalid__'))
            .join(', ');

          return (
            <li key={group.key} className={`histogram-row outcome-${group.outcome}`}>
              <div className="histogram-label">
                <span className="histogram-icon" aria-hidden="true">
                  {OUTCOME_ICON[group.outcome]}
                </span>
                <span className="histogram-answer-text">{group.label}</span>
                {group.outcome === 'host-match' && <span className="histogram-host-badge">Host's Answer</span>}
              </div>
              <div className="histogram-bar-row">
                <div className="histogram-bar-track">
                  <div className="histogram-bar-fill" style={{ transform: `scaleX(${Math.max(fraction, 0.03)})` }} />
                </div>
                <span className="histogram-count">{group.players.length}</span>
              </div>
              <p className="histogram-names">{names}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
