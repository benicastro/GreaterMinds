import { PromptDefinition } from '../types.js';

export const planets: PromptDefinition = {
  id: 'planets',
  category: 'Planets in the Solar System',
  promptText: 'Name a planet in the Solar System.',
  canonicalAnswers: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
  rejections: ['Pluto'],
  hostAnswer: 'Earth',
};
