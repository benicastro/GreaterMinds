import { PromptDefinition } from '../types.js';

export const phVicePresidents: PromptDefinition = {
  id: 'ph-vice-presidents',
  category: 'Philippine Vice Presidents',
  promptText: 'Name a Philippine Vice President (surname only).',
  // Already deduplicated per the design doc: "Laurel" covers both José P. Laurel and
  // Salvador Laurel; "Lopez" covers both of Fernando Lopez's non-consecutive terms.
  canonicalAnswers: [
    'Laurel',
    'Osmeña',
    'Quirino',
    'Lopez',
    'Garcia',
    'Macapagal',
    'Estrada',
    'Arroyo',
    'De Castro',
    'Binay',
    'Robredo',
    'Duterte',
  ],
  hostAnswer: 'Laurel',
};
