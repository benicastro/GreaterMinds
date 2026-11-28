import { describe, expect, it } from 'vitest';
import { LIVE_OPENER_PROMPT_IDS, LIVE_PROMPT_REGISTRY, LIVE_PROMPTS_BY_ID } from './prompts.js';
import {
  LiveAdaptiveSelector,
  buildLiveTierOrder,
  liveTierFallbackOrder,
  liveTierForPlayers,
} from './selection.js';

/** Small deterministic PRNG so shuffles are reproducible across runs. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const ALL_IDS = LIVE_PROMPT_REGISTRY.map((prompt) => prompt.id);
const NO_OPENERS = ALL_IDS.filter((id) => !LIVE_OPENER_PROMPT_IDS.includes(id));
const idsInTier = (tier: string) => LIVE_PROMPT_REGISTRY.filter((p) => p.tier === tier).map((p) => p.id);
const isFunny = (id: string) => Boolean(LIVE_PROMPTS_BY_ID.get(id)?.funny);

describe('live prompt registry', () => {
  it('has unique ids and the agreed tier counts', () => {
    expect(new Set(ALL_IDS).size).toBe(ALL_IDS.length);
    expect(idsInTier('big')).toHaveLength(12);
    expect(idsInTier('medium')).toHaveLength(13);
    expect(idsInTier('small')).toHaveLength(6);
    expect(idsInTier('big').filter(isFunny)).toHaveLength(4);
    expect(idsInTier('medium').filter(isFunny)).toHaveLength(6);
    expect(idsInTier('small').filter(isFunny)).toHaveLength(0);
  });
});

describe('liveTierForPlayers', () => {
  it('maps 8+ to big, 4–7 to medium, 2–3 to small', () => {
    expect(liveTierForPlayers(15)).toBe('big');
    expect(liveTierForPlayers(8)).toBe('big');
    expect(liveTierForPlayers(7)).toBe('medium');
    expect(liveTierForPlayers(4)).toBe('medium');
    expect(liveTierForPlayers(3)).toBe('small');
    expect(liveTierForPlayers(2)).toBe('small');
  });
});

describe('liveTierFallbackOrder', () => {
  it('tries the wanted tier, then smaller ones, then larger ones', () => {
    expect(liveTierFallbackOrder('big')).toEqual(['big', 'medium', 'small']);
    expect(liveTierFallbackOrder('medium')).toEqual(['medium', 'small', 'big']);
    expect(liveTierFallbackOrder('small')).toEqual(['small', 'medium', 'big']);
  });
});

describe('buildLiveTierOrder', () => {
  it('pairs one funny with one regular until funny prompts run out', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const tier of ['big', 'medium']) {
        const ids = idsInTier(tier);
        const order = buildLiveTierOrder(ids, seeded(seed));
        expect([...order].sort()).toEqual([...ids].sort());
        const funnyCount = ids.filter(isFunny).length;
        const pairCount = Math.min(funnyCount, ids.length - funnyCount);
        for (let pair = 0; pair < pairCount; pair += 1) {
          const kinds = [order[pair * 2], order[pair * 2 + 1]].map(isFunny);
          expect(kinds.filter(Boolean)).toHaveLength(1);
        }
      }
    }
  });

  it('does not always open with a funny prompt, nor always with a regular one', () => {
    const ids = idsInTier('big');
    const firsts = Array.from({ length: 400 }, (_, seed) => isFunny(buildLiveTierOrder(ids, seeded(seed + 1))[0]));
    const funnyFirstShare = firsts.filter(Boolean).length / firsts.length;
    expect(funnyFirstShare).toBeGreaterThan(0.35);
    expect(funnyFirstShare).toBeLessThan(0.65);
  });

  it('shuffles differently from game to game', () => {
    const ids = idsInTier('small');
    const orders = new Set(Array.from({ length: 20 }, (_, seed) => buildLiveTierOrder(ids, seeded(seed + 1)).join()));
    expect(orders.size).toBeGreaterThan(1);
  });

  it('handles a tier with no funny prompts', () => {
    const ids = idsInTier('small');
    expect([...buildLiveTierOrder(ids, seeded(7))].sort()).toEqual([...ids].sort());
  });
});

describe('LiveAdaptiveSelector openers', () => {
  it('opens with Color then Ends in -ent, whatever the player count', () => {
    for (const players of [15, 6, 3, 2]) {
      const selector = new LiveAdaptiveSelector(ALL_IDS, seeded(players));
      const first = selector.next(players);
      const second = selector.next(players);
      expect([first?.promptId, second?.promptId]).toEqual(['live-color', 'live-ends-in-ent']);
      expect(first?.opener && second?.opener).toBe(true);
      expect(selector.next(players)?.opener).toBe(false);
    }
  });

  it('skips an opener the host removed', () => {
    const selector = new LiveAdaptiveSelector(
      ALL_IDS.filter((id) => id !== 'live-color'),
      seeded(11),
    );
    expect(selector.next(15)).toMatchObject({ promptId: 'live-ends-in-ent', opener: true });
    expect(selector.next(15)?.opener).toBe(false);
  });

  it('never repeats an opener later, and keeps funny/regular pairs in Big after the openers', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const selector = new LiveAdaptiveSelector(ALL_IDS, seeded(seed));
      const played: string[] = [];
      let pick;
      while ((pick = selector.next(15))) played.push(pick.promptId);
      expect(played.filter((id) => LIVE_OPENER_PROMPT_IDS.includes(id))).toEqual([...LIVE_OPENER_PROMPT_IDS]);
      const bigAfter = played.slice(2).filter((id) => LIVE_PROMPTS_BY_ID.get(id)!.tier === 'big');
      expect(bigAfter).toHaveLength(10);
      for (let pair = 0; pair < 4; pair += 1) {
        expect(isFunny(bigAfter[pair * 2]) !== isFunny(bigAfter[pair * 2 + 1])).toBe(true);
      }
    }
  });

  it('openers are Big, regular prompts in the registry', () => {
    for (const id of LIVE_OPENER_PROMPT_IDS) {
      expect(LIVE_PROMPTS_BY_ID.get(id)).toMatchObject({ tier: 'big' });
      expect(isFunny(id)).toBe(false);
    }
  });
});

describe('LiveAdaptiveSelector', () => {
  it('draws from the tier that fits the player count', () => {
    const selector = new LiveAdaptiveSelector(NO_OPENERS, seeded(3));
    expect(selector.next(15)?.tier).toBe('big');
    expect(selector.next(6)?.tier).toBe('medium');
    expect(selector.next(2)?.tier).toBe('small');
  });

  it('steps down a tier when the wanted one is used up, and reports it', () => {
    const selector = new LiveAdaptiveSelector(ALL_IDS, seeded(4));
    for (let i = 0; i < 12; i += 1) expect(selector.next(15)?.tier).toBe('big'); // 2 openers + 10 Big
    const pick = selector.next(15);
    expect(pick?.wantedTier).toBe('big');
    expect(pick?.tier).toBe('medium');
  });

  it('steps up only once every smaller tier is empty', () => {
    const selector = new LiveAdaptiveSelector(NO_OPENERS, seeded(5));
    for (let i = 0; i < 6; i += 1) expect(selector.next(2)?.tier).toBe('small');
    expect(selector.next(2)).toMatchObject({ tier: 'medium', wantedTier: 'small' });
    const mediumSelector = new LiveAdaptiveSelector(
      [...idsInTier('big'), ...idsInTier('medium')].filter((id) => !LIVE_OPENER_PROMPT_IDS.includes(id)),
      seeded(6),
    );
    for (let i = 0; i < 13; i += 1) mediumSelector.next(5);
    expect(mediumSelector.next(5)).toMatchObject({ tier: 'big', wantedTier: 'medium' });
  });

  it('plays every selected prompt exactly once, then returns null', () => {
    const selector = new LiveAdaptiveSelector(ALL_IDS, seeded(8));
    const seen: string[] = [];
    let pick;
    while ((pick = selector.next(10))) seen.push(pick.promptId);
    expect(seen.sort()).toEqual([...ALL_IDS].sort());
    expect(selector.remaining()).toBe(0);
  });

  it('only uses the prompts the host selected', () => {
    const chosen = ['live-color', 'live-planet', 'live-season'];
    const selector = new LiveAdaptiveSelector(chosen, seeded(9));
    const seen = [selector.next(15), selector.next(15), selector.next(15)].map((p) => p?.promptId);
    expect(seen.sort()).toEqual([...chosen].sort());
    expect(selector.next(15)).toBeNull();
  });
});
