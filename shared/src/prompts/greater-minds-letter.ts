import { PromptDefinition } from '../types.js';

// Unique letters in "GREATER MINDS" (10 of them; repeats like the second E/R are not distinct answers).
export const greaterMindsLetter: PromptDefinition = {
  id: 'greater-minds-letter',
  category: 'GREATER MINDS Letter',
  promptText: 'Choose a letter that appears in "GREATER MINDS."',
  canonicalAnswers: ['G', 'R', 'E', 'A', 'T', 'M', 'I', 'N', 'D', 'S'],
  hostAnswer: 'M',
};
