import { PromptDefinition } from '../types.js';

// A focal-point prompt: the game never judges whether this is genuinely a player's
// least-favorite meeting day — all seven days are valid answers.
export const worstMeetingDay: PromptDefinition = {
  id: 'worst-meeting-day',
  category: 'Worst Meeting Day',
  promptText: 'Pick the worst day for a meeting.',
  canonicalAnswers: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  aliases: {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Tues: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Thurs: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  },
  hostAnswer: 'Monday',
};
