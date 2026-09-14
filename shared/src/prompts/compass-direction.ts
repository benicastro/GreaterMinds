import { PromptDefinition } from '../types.js';

// Cardinal directions only (not the intercardinal points) — keeps this one of the tightest
// prompts in the bank, fitting for late-game rounds with a small active field.
export const compassDirection: PromptDefinition = {
  id: 'compass-direction',
  category: 'Compass Direction',
  promptText: 'Choose a compass direction.',
  canonicalAnswers: ['North', 'South', 'East', 'West'],
  aliases: {
    N: 'North',
    S: 'South',
    E: 'East',
    W: 'West',
  },
  hostAnswer: 'North',
};
