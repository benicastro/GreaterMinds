import { PromptDefinition } from '../types.js';

export const cardSuit: PromptDefinition = {
  id: 'card-suit',
  category: 'Playing Card Suit',
  promptText: 'Name a playing card suit.',
  canonicalAnswers: ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
  aliases: {
    Heart: 'Hearts',
    Diamond: 'Diamonds',
    Club: 'Clubs',
    Spade: 'Spades',
  },
  hostAnswer: 'Diamonds',
};
