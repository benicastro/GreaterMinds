import { describe, expect, it } from 'vitest';
import { computeLiveStandings } from './standings.js';
import type { LiveStanding } from './types.js';

function player(id: string, strikes: number, eliminatedInRound: number | null = null): LiveStanding {
  return {
    playerId: id,
    nickname: id,
    connected: true,
    strikes,
    eliminated: eliminatedInRound !== null,
    eliminatedInRound,
  };
}

describe('computeLiveStandings', () => {
  it('ranks players still in by fewest strikes', () => {
    const ranked = computeLiveStandings([player('a', 2), player('b', 0), player('c', 1)]);
    expect(ranked.map((p) => [p.playerId, p.rank])).toEqual([
      ['b', 1],
      ['c', 2],
      ['a', 3],
    ]);
  });

  it('ranks every survivor above every eliminated player', () => {
    const ranked = computeLiveStandings([player('out', 3, 5), player('in', 2)]);
    expect(ranked.map((p) => p.playerId)).toEqual(['in', 'out']);
  });

  it('ranks eliminated players by how long they lasted', () => {
    const ranked = computeLiveStandings([player('early', 3, 2), player('late', 3, 7), player('mid', 3, 4)]);
    expect(ranked.map((p) => [p.playerId, p.rank])).toEqual([
      ['late', 1],
      ['mid', 2],
      ['early', 3],
    ]);
  });

  it('ties survivors on equal strikes and players eliminated in the same round', () => {
    const ranked = computeLiveStandings([
      player('a', 1),
      player('b', 1),
      player('c', 3, 3),
      player('d', 3, 3),
      player('e', 3, 1),
    ]);
    expect(ranked.map((p) => p.rank)).toEqual([1, 1, 3, 3, 5]);
  });
});
