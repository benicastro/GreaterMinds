import { PromptDefinition } from '../types.js';

export const rainbowColor: PromptDefinition = {
  id: 'rainbow-color',
  category: 'Rainbow Color',
  promptText: 'Choose a rainbow color.',
  canonicalAnswers: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'],
  aliases: {
    Purple: 'Violet',
  },
  hostAnswer: 'Red',
};
