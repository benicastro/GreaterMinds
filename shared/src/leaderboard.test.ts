import { describe, expect, it } from 'vitest';
import { computeLeaderboard } from './leaderboard.js';

describe('computeLeaderboard', () => {
  it('ranks distinct scores sequentially', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 10 },
      { playerId: 'b', nickname: 'Bob', score: 8 },
      { playerId: 'c', nickname: 'Carol', score: 6 },
    ]);
    expect(result.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it('gives tied scores the same rank and skips the next rank accordingly', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 6 },
      { playerId: 'b', nickname: 'Bob', score: 7 },
      { playerId: 'c', nickname: 'Carol', score: 7 },
    ]);
    const byName = (name: string) => result.find((entry) => entry.nickname === name)!;
    expect(byName('Bob').rank).toBe(1);
    expect(byName('Carol').rank).toBe(1);
    expect(byName('Alice').rank).toBe(3);
  });

  it('handles a three-way tie for first correctly', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 5 },
      { playerId: 'b', nickname: 'Bob', score: 5 },
      { playerId: 'c', nickname: 'Carol', score: 5 },
      { playerId: 'd', nickname: 'Dave', score: 2 },
    ]);
    expect(result.filter((entry) => entry.rank === 1)).toHaveLength(3);
    expect(result.find((entry) => entry.nickname === 'Dave')!.rank).toBe(4);
  });

  it('handles an all-tied field (everyone rank 1)', () => {
    const result = computeLeaderboard([
      { playerId: 'a', nickname: 'Alice', score: 4 },
      { playerId: 'b', nickname: 'Bob', score: 4 },
    ]);
    expect(result.every((entry) => entry.rank === 1)).toBe(true);
  });
});
