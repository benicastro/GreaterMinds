/**
 * Live Mode prompts are free text: the host judges every match by ear, so there are no answer
 * lists, aliases or validation — just the question.
 */
export interface LivePromptDefinition {
  /** Stable slug. Never change once games may reference it. */
  id: string;
  /** Short label, e.g. "Fruit". */
  category: string;
  /** The question shown to players. */
  promptText: string;
}

/**
 * PLACEHOLDER SET — the real Live Mode prompts haven't been written yet. These exist only so the
 * mode can be played end to end; replace this list wholesale when the real prompts are ready.
 */
export const LIVE_PROMPT_REGISTRY: LivePromptDefinition[] = [
  { id: 'live-fruit', category: 'Fruit', promptText: 'Name a fruit.' },
  { id: 'live-animal', category: 'Animal', promptText: 'Name an animal.' },
  { id: 'live-color', category: 'Color', promptText: 'Name a color.' },
  { id: 'live-breakfast', category: 'Filipino Breakfast', promptText: 'Name a Filipino breakfast food.' },
  { id: 'live-sport', category: 'Sport', promptText: 'Name a sport.' },
  { id: 'live-beach', category: 'Beach Bag', promptText: 'Name something you bring to the beach.' },
  { id: 'live-country', category: 'Country', promptText: 'Name a country.' },
  { id: 'live-ice-cream', category: 'Ice Cream', promptText: 'Name an ice cream flavor.' },
  { id: 'live-number', category: 'Number', promptText: 'Pick a whole number from 1 to 10.' },
  { id: 'live-coin', category: 'Coin Flip', promptText: 'Heads or tails?' },
];

export const LIVE_PROMPTS_BY_ID: Map<string, LivePromptDefinition> = new Map(
  LIVE_PROMPT_REGISTRY.map((prompt) => [prompt.id, prompt]),
);

/** Live Mode shows only the title slide before round 1 (the rules infographic is Classic's). */
export const LIVE_INTRO_SLIDE_COUNT = 1;
