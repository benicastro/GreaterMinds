import { PromptDefinition } from '../types.js';

// Current 11-member ASEAN roster (Timor-Leste admitted 2025).
export const aseanCountry: PromptDefinition = {
  id: 'asean-country',
  category: 'ASEAN Country',
  promptText: 'Choose an ASEAN country.',
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
    'Timor-Leste',
    'Vietnam',
  ],
  aliases: {
    'Brunei Darussalam': 'Brunei',
    'Lao PDR': 'Laos',
    'Viet Nam': 'Vietnam',
    'East Timor': 'Timor-Leste',
  },
  hostAnswer: 'Philippines',
};
