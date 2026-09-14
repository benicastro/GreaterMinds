import { PromptDefinition } from '../types.js';

export const canadianProvince: PromptDefinition = {
  id: 'canadian-province',
  category: 'Canadian Province',
  promptText: 'Choose a Canadian province.',
  canonicalAnswers: [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
  ],
  aliases: {
    // Standard Canada Post 2-letter provincial abbreviations.
    AB: 'Alberta',
    BC: 'British Columbia',
    MB: 'Manitoba',
    NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador',
    NS: 'Nova Scotia',
    ON: 'Ontario',
    PE: 'Prince Edward Island',
    PEI: 'Prince Edward Island',
    QC: 'Quebec',
    SK: 'Saskatchewan',
  },
  rejections: ['Yukon', 'Northwest Territories', 'NWT', 'Nunavut'],
  hostAnswer: 'Alberta',
};
