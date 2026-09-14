import { PromptDefinition } from '../types.js';

export const season: PromptDefinition = {
  id: 'season',
  category: 'Season',
  promptText: 'Name a season of the year.',
  canonicalAnswers: ['Spring', 'Summer', 'Autumn', 'Winter'],
  aliases: {
    Fall: 'Autumn',
  },
  hostAnswer: 'Summer',
};
