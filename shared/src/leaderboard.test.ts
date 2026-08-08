import { describe, expect, it } from 'vitest';
import { computeLeaderboard } from './leaderboard.js';

describe('computeLeaderboard', () => {
  it('ranks distinct scores sequentially', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 10, eliminated: false },
      { playerId: 'b', nickname: 'Bob', score: 8, eliminated: false },
      { playerId: 'c', nickname: 'Carol', score: 6, eliminated: false },
    ]);
    expect(result.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it('gives tied scores the same rank and skips the next rank accordingly', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 6, eliminated: false },
      { playerId: 'b', nickname: 'Bob', score: 7, eliminated: false },
      { playerId: 'c', nickname: 'Carol', score: 7, eliminated: false },
    ]);
    const byName = (name: string) => result.find((entry) => entry.nickname === name)!;
    expect(byName('Bob').rank).toBe(1);
    expect(byName('Carol').rank).toBe(1);
    expect(byName('Alice').rank).toBe(3);
  });

  it('handles a three-way tie for first correctly', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 5, eliminated: false },
      { playerId: 'b', nickname: 'Bob', score: 5, eliminated: false },
      { playerId: 'c', nickname: 'Carol', score: 5, eliminated: false },
      { playerId: 'd', nickname: 'Dave', score: 2, eliminated: false },
    ]);
    expect(result.filter((entry) => entry.rank === 1)).toHaveLength(3);
    expect(result.find((entry) => entry.nickname === 'Dave')!.rank).toBe(4);
  });

  it('handles an all-tied field (everyone rank 1)', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 4, eliminated: false },
      { playerId: 'b', nickname: 'Bob', score: 4, eliminated: false },
    ]);
    expect(result.every((entry) => entry.rank === 1)).toBe(true);
  });

  it('passes the eliminated flag through, and eliminated players (always negative) never outrank active ones', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 3, eliminated: false },
      { playerId: 'b', nickname: 'Bob', score: -1, eliminated: true },
    ]);
    const byName = (name: string) => result.find((entry) => entry.nickname === name)!;
    expect(byName('Alice').eliminated).toBe(false);
    expect(byName('Bob').eliminated).toBe(true);
    expect(byName('Alice').rank).toBe(1);
    expect(byName('Bob').rank).toBe(2);
  });
});
