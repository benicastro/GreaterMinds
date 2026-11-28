import { LIVE_PROMPTS_BY_ID, LIVE_TIERS, type LiveTier } from './prompts.js';

/** Players still in at or above which Big prompts are played. */
export const LIVE_TIER_BIG_MIN_PLAYERS = 8;
/** Players still in at or above which Medium prompts are played (below this: Small). */
export const LIVE_TIER_MEDIUM_MIN_PLAYERS = 4;

/** The tier that fits this many players still in: 8+ → Big, 4–7 → Medium, 2–3 → Small. */
export function liveTierForPlayers(activeCount: number): LiveTier {
  if (activeCount >= LIVE_TIER_BIG_MIN_PLAYERS) return 'big';
  if (activeCount >= LIVE_TIER_MEDIUM_MIN_PLAYERS) return 'medium';
  return 'small';
}

/**
 * Order to try tiers in when `wanted` is used up: `wanted` first, then each smaller tier, then
 * each larger one (nearest first). Stepping down tightens the game, which is what a slow game
 * needs; stepping up is only a last resort.
 */
export function liveTierFallbackOrder(wanted: LiveTier): LiveTier[] {
  const index = LIVE_TIERS.indexOf(wanted);
  return [wanted, ...LIVE_TIERS.slice(index + 1), ...LIVE_TIERS.slice(0, index).reverse()];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * One tier's play order for a game: funny and regular prompts are each shuffled, then dealt in
 * pairs — one funny and one regular per pair, in random order — until either kind runs out; the
 * rest follow in their shuffled order. So funny prompts come up about every other round without
 * always opening the tier.
 */
export function buildLiveTierOrder(promptIds: string[], random: () => number = Math.random): string[] {
  const funny = shuffle(
    promptIds.filter((id) => LIVE_PROMPTS_BY_ID.get(id)?.funny),
    random,
  );
  const regular = shuffle(
    promptIds.filter((id) => !LIVE_PROMPTS_BY_ID.get(id)?.funny),
    random,
  );
  const order: string[] = [];
  while (funny.length > 0 && regular.length > 0) {
    const pair = [funny.shift()!, regular.shift()!];
    if (random() < 0.5) pair.reverse();
    order.push(...pair);
  }
  return [...order, ...funny, ...regular];
}

export interface LiveAdaptivePick {
  promptId: string;
  /** The tier the prompt came from. */
  tier: LiveTier;
  /** The tier the player count called for — differs from `tier` when that one was used up. */
  wantedTier: LiveTier;
}

/**
 * Adaptive round selection for Three Strikes. Built once per game from the host's selected
 * prompts; each `next()` call picks the tier for the current player count and takes that tier's
 * next prompt, falling back per `liveTierFallbackOrder` when the tier is used up.
 */
export class LiveAdaptiveSelector {
  private readonly queues: Record<LiveTier, string[]>;

  constructor(promptIds: string[], random: () => number = Math.random) {
    const byTier: Record<LiveTier, string[]> = { big: [], medium: [], small: [] };
    for (const id of promptIds) {
      const def = LIVE_PROMPTS_BY_ID.get(id);
      if (def) byTier[def.tier].push(id);
    }
    this.queues = {
      big: buildLiveTierOrder(byTier.big, random),
      medium: buildLiveTierOrder(byTier.medium, random),
      small: buildLiveTierOrder(byTier.small, random),
    };
  }

  remaining(): number {
    return LIVE_TIERS.reduce((sum, tier) => sum + this.queues[tier].length, 0);
  }

  /** Next prompt for this many players still in, or null when every prompt has been played. */
  next(activeCount: number): LiveAdaptivePick | null {
    const wantedTier = liveTierForPlayers(activeCount);
    for (const tier of liveTierFallbackOrder(wantedTier)) {
      const promptId = this.queues[tier].shift();
      if (promptId) return { promptId, tier, wantedTier };
    }
    return null;
  }
}
