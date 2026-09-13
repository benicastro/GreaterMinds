import { PromptDefinition } from '../types.js';

// Re-recorded "(Taylor's Version)" albums are normalized to their original studio album rather
// than accepted as separate answers, to keep the answer space clean.
export const taylorSwiftAlbum: PromptDefinition = {
  id: 'taylor-swift-album',
  category: 'Taylor Swift Studio Album',
  promptText: 'Choose a Taylor Swift studio album.',
  canonicalAnswers: [
    'Taylor Swift',
    'Fearless',
    'Speak Now',
    'Red',
    '1989',
    'Reputation',
    'Lover',
    'Folklore',
    'Evermore',
    'Midnights',
    'The Tortured Poets Department',
  ],
  aliases: {
    "Fearless (Taylor's Version)": 'Fearless',
    "Fearless Taylor's Version": 'Fearless',
    'Fearless (TV)': 'Fearless',
    'Fearless TV': 'Fearless',
    "Speak Now (Taylor's Version)": 'Speak Now',
    "Speak Now Taylor's Version": 'Speak Now',
    'Speak Now (TV)': 'Speak Now',
    'Speak Now TV': 'Speak Now',
    "Red (Taylor's Version)": 'Red',
    "Red Taylor's Version": 'Red',
    'Red (TV)': 'Red',
    'Red TV': 'Red',
    "1989 (Taylor's Version)": '1989',
    "1989 Taylor's Version": '1989',
    '1989 (TV)': '1989',
    '1989 TV': '1989',
  },
  hostAnswer: '1989',
};
