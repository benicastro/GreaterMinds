import { PromptDefinition } from '../types.js';

export const daysOfWeek: PromptDefinition = {
  id: 'days-of-week',
  category: 'Days of the Week',
  promptText: 'Name a day of the week.',
  canonicalAnswers: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  hostAnswer: 'Monday',
};
