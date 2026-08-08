import { PromptDefinition } from '../types.js';

export const starterPokemon: PromptDefinition = {
  id: 'starter-pokemon',
  category: 'Starter Pokémon (Generations I–III)',
  promptText: 'Name a starter Pokémon from Generations I–III.',
  canonicalAnswers: [
    'Bulbasaur',
    'Charmander',
    'Squirtle',
    'Chikorita',
    'Cyndaquil',
    'Totodile',
    'Treecko',
    'Torchic',
    'Mudkip',
  ],
  hostAnswer: 'Squirtle',
};
