import { PromptDefinition } from '../types.js';

export const metroManilaCity: PromptDefinition = {
  id: 'metro-manila-city',
  category: 'City in Metro Manila',
  promptText: 'Name a city in Metro Manila.',
  canonicalAnswers: [
    'Caloocan',
    'Las Piñas',
    'Makati',
    'Malabon',
    'Mandaluyong',
    'Manila',
    'Marikina',
    'Muntinlupa',
    'Navotas',
    'Parañaque',
    'Pasay',
    'Pasig',
    'Quezon City',
    'San Juan',
    'Taguig',
    'Valenzuela',
  ],
  aliases: {
    QC: 'Quezon City',
    'Q.C.': 'Quezon City',
    'Las Pinas': 'Las Piñas',
    Paranaque: 'Parañaque',
  },
  // Pateros is a municipality, not a city; Metro Manila/NCR are the region itself, not a city within it.
  rejections: ['Pateros', 'Metro Manila', 'NCR'],
  hostAnswer: 'Quezon City',
};
