import { PromptDefinition } from '../types.js';

export const friendsCharacter: PromptDefinition = {
  id: 'friends-character',
  category: 'Friends Character',
  promptText: 'Name one of the six main characters in Friends.',
  canonicalAnswers: ['Ross Geller', 'Rachel Green', 'Monica Geller', 'Chandler Bing', 'Joey Tribbiani', 'Phoebe Buffay'],
  aliases: {
    Ross: 'Ross Geller',
    Rachel: 'Rachel Green',
    Monica: 'Monica Geller',
    Chandler: 'Chandler Bing',
    Joey: 'Joey Tribbiani',
    Phoebe: 'Phoebe Buffay',
    // NOTE: "Geller" is deliberately not aliased to either Ross or Monica — both share that
    // surname, so it's ambiguous, same judgment call as "Maguindanao" and "Region 4" elsewhere.
  },
  hostAnswer: 'Phoebe Buffay',
};
