import { PromptDefinition } from '../types.js';

export const cardRank: PromptDefinition = {
  id: 'card-rank',
  category: 'Playing-Card Rank',
  promptText: 'Pick a standard playing-card rank.',
  canonicalAnswers: [
    'Ace',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'Jack',
    'Queen',
    'King',
  ],
  aliases: {
    A: 'Ace',
    J: 'Jack',
    Q: 'Queen',
    K: 'King',
  },
  hostAnswer: 'Queen',
};
