import { PromptDefinition } from '../types.js';

export const aseanCountry: PromptDefinition = {
  id: 'asean-country',
  category: 'ASEAN Country',
  promptText: 'Name an ASEAN country.',
  canonicalAnswers: [
    'Brunei',
    'Cambodia',
    'Indonesia',
    'Laos',
    'Malaysia',
    'Myanmar',
    'Philippines',
    'Singapore',
    'Thailand',
    'Vietnam',
  ],
  aliases: {
    'Brunei Darussalam': 'Brunei',
    'Lao PDR': 'Laos',
    'Viet Nam': 'Vietnam',
  },
  hostAnswer: 'Philippines',
};
