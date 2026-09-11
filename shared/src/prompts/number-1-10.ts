import { PromptDefinition, ValidationResult } from '../types.js';
import { normalizeForMatch } from '../validation/normalize.js';

const WORD_TO_DIGIT: Record<string, string> = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
};

function validateNumber(raw: string): ValidationResult {
  const normalized = normalizeForMatch(raw);
  if (!normalized) {
    return { valid: false };
  }

  const asWord = WORD_TO_DIGIT[normalized];
  const candidate = asWord ?? normalized;

  // Only whole numbers are accepted — reject decimals, fractions, non-numeric text.
  if (!/^\d+$/.test(candidate)) {
    return { valid: false };
  }

  const value = Number.parseInt(candidate, 10);
  if (value < 1 || value > 10) {
    return { valid: false };
  }

  return { valid: true, canonicalAnswer: String(value) };
}

export const number1To10: PromptDefinition = {
  id: 'number-1-10',
  category: 'Whole Number',
  promptText: 'Pick a whole number from 1 to 10.',
  canonicalAnswers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  hostAnswer: '7',
  validate: validateNumber,
};
