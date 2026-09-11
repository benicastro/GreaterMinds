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
    BC: 'British Columbia',
    PEI: 'Prince Edward Island',
  },
  rejections: ['Yukon', 'Northwest Territories', 'NWT', 'Nunavut'],
  hostAnswer: 'Alberta',
};
