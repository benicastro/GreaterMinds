import { PromptDefinition } from '../types.js';

export const continents: PromptDefinition = {
  id: 'continents',
  category: 'Continents',
  promptText: 'Name a continent.',
  canonicalAnswers: [
    'Africa',
    'Antarctica',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Australia',
  ],
  // Doc: "Optionally accept Oceania as an alias for Australia." Enabled by default.
  aliases: { Oceania: 'Australia' },
  hostAnswer: 'Asia',
};
