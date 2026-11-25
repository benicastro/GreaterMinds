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
 * TEST SET — approved by the user (2026-11-25) for playtesting only; expect it to be replaced
 * after the first test games. Ordered from big answer pools to tiny ones, so with the fixed round
 * order the choices narrow as the game goes on. The late prompts deliberately have 3+ answers:
 * with two players plus the host, a two-option prompt guarantees a match.
 */
export const LIVE_PROMPT_REGISTRY: LivePromptDefinition[] = [
  // Big pool — for ~10–20 players
  { id: 'live-external-body-part', category: 'Body Part', promptText: 'Name an external body part.' },
  { id: 'live-color', category: 'Color', promptText: 'Name a color.' },
  { id: 'live-bed-animal', category: 'Bed Buddy', promptText: 'Name an animal you would NOT want in your bed.' },
  { id: 'live-late-excuse', category: 'Late Excuse', promptText: 'Name an excuse for being late to work.' },
  { id: 'live-lola-kitchen', category: "Lola's Kitchen", promptText: "Name something you'd find in your lola's kitchen." },
  { id: 'live-street-food', category: 'Street Food', promptText: 'Name a Filipino street food.' },
  { id: 'live-sticky', category: 'Sticky', promptText: "Name something that's sticky." },
  { id: 'live-fruit', category: 'Fruit', promptText: 'Name a fruit.' },
  // Medium pool — for ~5–10 players
  { id: 'live-bahay-kubo', category: 'Bahay Kubo', promptText: 'Name a vegetable from "Bahay Kubo."' },
  { id: 'live-pizza-topping', category: 'Pizza Topping', promptText: 'Name a pizza topping.' },
  { id: 'live-farm-animal', category: 'Farm Animal', promptText: 'Name a farm animal.' },
  { id: 'live-paired-body-part', category: 'Pairs', promptText: 'Name a body part that comes in pairs.' },
  { id: 'live-cancel-month', category: 'Cancel a Month', promptText: "Name a month you'd cancel if you could." },
  { id: 'live-day-of-week', category: 'Day of the Week', promptText: 'Name a day of the week.' },
  { id: 'live-vacation-continent', category: 'Vacation', promptText: "Name a continent you'd go on vacation to." },
  // Small pool — for the last 2–4 players
  { id: 'live-finger', category: 'Finger', promptText: 'Name a finger.' },
  { id: 'live-five-senses', category: 'Senses', promptText: 'Name one of the five senses.' },
  { id: 'live-meal', category: 'Meal', promptText: 'Name a meal of the day.' },
  { id: 'live-traffic-light', category: 'Traffic Light', promptText: 'Name a traffic-light color.' },
  { id: 'live-rock-paper-scissors', category: 'Rock Paper Scissors', promptText: 'Rock, paper or scissors?' },
];

export const LIVE_PROMPTS_BY_ID: Map<string, LivePromptDefinition> = new Map(
  LIVE_PROMPT_REGISTRY.map((prompt) => [prompt.id, prompt]),
);

/** Live Mode shows only the title slide before round 1 (the rules infographic is Classic's). */
export const LIVE_INTRO_SLIDE_COUNT = 1;
