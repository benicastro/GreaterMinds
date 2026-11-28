/**
 * Three Strikes (Live Mode) prompts are free text: the host judges every match by ear, so there
 * are no answer lists, aliases or validation — just the question, plus a size tier used by
 * adaptive round selection (see `./selection.ts`).
 */

/**
 * Rough size of a prompt's realistic answer pool. Adaptive selection plays the tier that fits the
 * number of players still in: Big for a full room, Small for the last two or three.
 */
export type LiveTier = 'big' | 'medium' | 'small';

/** Largest to smallest. Adaptive selection steps down this list when a tier runs out. */
export const LIVE_TIERS: readonly LiveTier[] = ['big', 'medium', 'small'];

export const LIVE_TIER_LABELS: Record<LiveTier, string> = {
  big: 'Big',
  medium: 'Medium',
  small: 'Small',
};

export interface LivePromptDefinition {
  /** Stable slug. Never change once games may reference it. */
  id: string;
  /** Short label, e.g. "Color". */
  category: string;
  /** The question shown to players. */
  promptText: string;
  tier: LiveTier;
  /** From the Funny Pool: given priority within its tier by adaptive selection. */
  funny?: boolean;
}

/**
 * The user's prompt set (2026-11-28), replacing the earlier 20-prompt test set. Tiers are as the
 * user suggested, except Bahay Kubo (moved Big → Medium: answers cluster on a few vegetables) and
 * Omnivore (moved Medium → Big: open-ended pool) — both agreed with the user. Prompt text is
 * verbatim. Within each tier, funny prompts are interleaved so Fixed round order (top to bottom)
 * doesn't bunch them up.
 */
export const LIVE_PROMPT_REGISTRY: LivePromptDefinition[] = [
  // ---- Big: most players still in ----
  { id: 'live-color', category: 'Color', promptText: 'Name any color.', tier: 'big' },
  {
    id: 'live-street-food-tl',
    category: 'Street Food',
    promptText: 'Magbigay ng isang pagkaing karaniwang mabibili sa kalsada.',
    tier: 'big',
    funny: true,
  },
  {
    id: 'live-periodic-element',
    category: 'Periodic Table',
    promptText: 'Name an element found in the periodic table.',
    tier: 'big',
  },
  {
    id: 'live-ghost-haunt',
    category: 'Multo',
    promptText: 'Kung isa kang multo, saang lugar mo gustong manakot ng tao?',
    tier: 'big',
    funny: true,
  },
  { id: 'live-external-body-part', category: 'Body Part', promptText: 'Name an external part of the human body.', tier: 'big' },
  {
    id: 'live-zombie-grab',
    category: 'Zombie Apocalypse',
    promptText: 'May zombie apocalypse! Anong bagay sa loob ng bahay ang una mong kukunin?',
    tier: 'big',
    funny: true,
  },
  { id: 'live-ends-in-ent', category: 'Ends in -ent', promptText: 'Give an English word that ends with "-ent."', tier: 'big' },
  {
    id: 'live-forgot-at-home',
    category: 'Naiwan sa Bahay',
    promptText: 'Anong bagay ang nakakahiya kapag nakalimutan mong dalhin o isuot bago umalis ng bahay?',
    tier: 'big',
    funny: true,
  },
  {
    id: 'live-starter-pokemon',
    category: 'Starter Pokémon',
    promptText: 'Name any first-stage starter Pokémon from any generation.',
    tier: 'big',
  },
  { id: 'live-taylor-swift-song', category: 'Taylor Swift Song', promptText: 'Name any officially released Taylor Swift song.', tier: 'big' },
  { id: 'live-asian-country', category: 'Asian Country', promptText: 'Name a country in Asia.', tier: 'big' },
  { id: 'live-omnivore', category: 'Omnivore', promptText: 'Name an animal that is classified as an omnivore.', tier: 'big' },

  // ---- Medium: about 4–7 players left ----
  {
    id: 'live-bahay-kubo',
    category: 'Bahay Kubo',
    promptText: 'Magbigay ng isang gulay o halamang binanggit sa kantang Bahay Kubo.',
    tier: 'medium',
  },
  {
    id: 'live-ends-in-kat',
    category: 'Ends in -kat',
    promptText: 'Magbigay ng isang salitang Tagalog na nagtatapos sa "-kat."',
    tier: 'medium',
    funny: true,
  },
  {
    id: 'live-nueva-ecija',
    category: 'Nueva Ecija',
    promptText: 'Name a city or municipality in the province of Nueva Ecija.',
    tier: 'medium',
  },
  {
    id: 'live-ends-in-bog',
    category: 'Ends in -bog',
    promptText: 'Magbigay ng isang salitang Tagalog na nagtatapos sa "-bog."',
    tier: 'medium',
    funny: true,
  },
  { id: 'live-zodiac-sign', category: 'Zodiac Sign', promptText: 'Name one of the twelve Western zodiac signs.', tier: 'medium' },
  {
    id: 'live-brownout',
    category: 'Brownout!',
    promptText: 'Brownout! Ano ang unang bagay na hahanapin mo?',
    tier: 'medium',
    funny: true,
  },
  { id: 'live-planet', category: 'Planet', promptText: 'Name a planet in our solar system.', tier: 'medium' },
  {
    id: 'live-no-internet',
    category: 'No Internet!',
    promptText: 'Biglang nawalan ng internet! Ano ang gagawin mo?',
    tier: 'medium',
    funny: true,
  },
  {
    id: 'live-rainbow-color',
    category: 'Rainbow Color',
    promptText: 'Name one of the seven traditional colors of the rainbow.',
    tier: 'medium',
  },
  {
    id: 'live-toilet-drop',
    category: 'Inidoro',
    promptText: 'Anong bagay ang ayaw na ayaw mong mahulog sa inidoro?',
    tier: 'medium',
    funny: true,
  },
  { id: 'live-taylor-swift-album', category: 'Taylor Swift Album', promptText: 'Name a Taylor Swift studio album.', tier: 'medium' },
  {
    id: 'live-always-missing',
    category: 'Laging Nawawala',
    promptText: 'Anong bagay sa loob ng bahay ang palaging nawawala?',
    tier: 'medium',
    funny: true,
  },
  { id: 'live-metro-manila-city', category: 'Metro Manila City', promptText: 'Name a city in Metro Manila.', tier: 'medium' },

  // ---- Small: the last two or three. Every prompt here has 3+ answers: with three answering,
  // fewer than three options would guarantee a match. ----
  { id: 'live-chess-piece', category: 'Chess Piece', promptText: 'Name a type of chess piece.', tier: 'small' },
  {
    id: 'live-finger-tl',
    category: 'Daliri',
    promptText: 'Magbigay ng pangalan ng isa sa limang daliri ng kamay.',
    tier: 'small',
  },
  {
    id: 'live-compass-direction',
    category: 'Compass Direction',
    promptText: 'Choose one of the four cardinal compass directions.',
    tier: 'small',
  },
  { id: 'live-season', category: 'Season', promptText: 'Name one of the four traditional seasons of the year.', tier: 'small' },
  {
    id: 'live-pancit-canton',
    category: 'Pancit Canton Flavor',
    promptText: 'Magbigay ng isang flavor ng Lucky Me! Pancit Canton.',
    tier: 'small',
  },
  { id: 'live-rock-paper-scissors', category: 'Rock Paper Scissors', promptText: 'Rock, Paper, Scissors! Choose one.', tier: 'small' },
];

export const LIVE_PROMPTS_BY_ID: Map<string, LivePromptDefinition> = new Map(
  LIVE_PROMPT_REGISTRY.map((prompt) => [prompt.id, prompt]),
);

/** Three Strikes shows only the title slide before round 1 (the rules infographic is Classic's). */
export const LIVE_INTRO_SLIDE_COUNT = 1;
