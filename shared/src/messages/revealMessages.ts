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
  // Doc didn't specify timeout messages (only the other 4 outcomes) — this set was written to
  // match the tone and confirmed by the user rather than sourced from the design doc.
  timeout: ['Too Slow.', 'The Clock Wins.', "Silence Isn't Golden.", 'Missed Your Moment.'],
};

export function pickRevealMessage(outcome: OutcomeBucket): string {
  const options = REVEAL_MESSAGES[outcome];
  return options[Math.floor(Math.random() * options.length)];
}
