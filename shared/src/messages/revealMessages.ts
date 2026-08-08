import { OutcomeBucket } from '../types.js';

export const REVEAL_MESSAGES: Record<OutcomeBucket, string[]> = {
  unique: ['Thinking Apart.', 'Original Mind.', 'No Collisions.', 'Greater Mind.'],
  'player-match': [
    'Great minds think alike.',
    'Brain collision!',
    'Shared a brain cell.',
    'So much for originality.',
  ],
  'host-match': [
    'You thought like the host.',
    'Wrong mind to match.',
    'Great mind. Wrong mind.',
    'That one hurts.',
  ],
  invalid: ['Rejected.', "Different is good. Wrong is not.", 'Nice try.', "That answer doesn't count."],
  // TODO(content): doc doesn't specify timeout messages — placeholder set, pending sign-off.
  timeout: ['Too Slow.', 'The Clock Wins.', "Silence Isn't Golden.", 'Missed Your Moment.'],
};

export function pickRevealMessage(outcome: OutcomeBucket): string {
  const options = REVEAL_MESSAGES[outcome];
  return options[Math.floor(Math.random() * options.length)];
}
