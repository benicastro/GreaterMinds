import { PromptDefinition } from '../types.js';

// Generic tetromino letter names (I/J/L/O/S/T/Z) rather than any third-party branded piece names.
export const tetromino: PromptDefinition = {
  id: 'tetromino',
  category: 'Tetromino',
  promptText: 'Pick a tetromino: I, J, L, O, S, T, or Z.',
  canonicalAnswers: ['I', 'J', 'L', 'O', 'S', 'T', 'Z'],
  hostAnswer: 'T',
};
