import { PromptDefinition } from '../types.js';

export const infinityStone: PromptDefinition = {
  id: 'infinity-stone',
  category: 'Infinity Stone',
  promptText: 'Name an Infinity Stone.',
  canonicalAnswers: ['Space Stone', 'Mind Stone', 'Reality Stone', 'Power Stone', 'Time Stone', 'Soul Stone'],
  aliases: {
    Space: 'Space Stone',
    Mind: 'Mind Stone',
    Reality: 'Reality Stone',
    Power: 'Power Stone',
    Time: 'Time Stone',
    Soul: 'Soul Stone',
  },
  hostAnswer: 'Soul Stone',
};
