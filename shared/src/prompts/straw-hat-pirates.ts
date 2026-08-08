import { PromptDefinition } from '../types.js';

export const strawHatPirates: PromptDefinition = {
  id: 'straw-hat-pirates',
  category: 'Current Straw Hat Pirates',
  promptText: 'Name a current member of the Straw Hat Pirates.',
  // Honorary members (e.g. Yamato) are intentionally excluded — never add them here.
  canonicalAnswers: [
    'Monkey D. Luffy',
    'Roronoa Zoro',
    'Nami',
    'Usopp',
    'Sanji',
    'Tony Tony Chopper',
    'Nico Robin',
    'Franky',
    'Brook',
    'Jinbe',
  ],
  aliases: {
    Luffy: 'Monkey D. Luffy',
    Zoro: 'Roronoa Zoro',
    Chopper: 'Tony Tony Chopper',
    Robin: 'Nico Robin',
    Jinbei: 'Jinbe',
  },
  hostAnswer: 'Roronoa Zoro',
};
