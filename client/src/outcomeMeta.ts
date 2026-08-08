import type { OutcomeBucket } from '@greater-minds/shared';

export const OUTCOME_ICON: Record<OutcomeBucket, string> = {
  unique: '✅',
  'player-match': '🤝',
  'host-match': '🎯',
  invalid: '❌',
  timeout: '⏱️',
};
