/**
 * Comparison key for matching answers. Folds diacritics (so "Paranaque" and
 * "Parañaque" compare equal), lowercases, strips periods/apostrophes, and
 * collapses whitespace. Canonical display strings elsewhere keep their accents;
 * this is only ever used as a lookup key, never shown to the user.
 */
export function normalizeForMatch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/[.'’]/g, '') // strip periods, apostrophes, curly apostrophes
    .replace(/\s+/g, ' ')
    .trim();
}
