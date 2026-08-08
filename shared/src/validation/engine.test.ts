import { describe, expect, it } from 'vitest';
import { compilePrompt, classifyAnswer } from './engine.js';
import { PROMPTS_BY_ID } from '../prompts/index.js';

function classify(promptId: string, raw: string) {
  const def = PROMPTS_BY_ID.get(promptId);
  if (!def) throw new Error(`unknown prompt ${promptId}`);
  return classifyAnswer(compilePrompt(def), raw);
}

describe('rainbow-color', () => {
  it('accepts a canonical answer case-insensitively', () => {
    expect(classify('rainbow-color', 'red')).toEqual({ valid: true, canonicalAnswer: 'Red' });
  });

  it('rejects unknown answers', () => {
    expect(classify('rainbow-color', 'Turquoise')).toEqual({ valid: false });
  });

  it('rejects empty input', () => {
    expect(classify('rainbow-color', '   ')).toEqual({ valid: false });
  });
});

describe('planets', () => {
  it('explicitly rejects Pluto', () => {
    expect(classify('planets', 'Pluto')).toEqual({ valid: false });
    expect(classify('planets', 'pluto')).toEqual({ valid: false });
  });

  it('accepts a real planet', () => {
    expect(classify('planets', 'jupiter')).toEqual({ valid: true, canonicalAnswer: 'Jupiter' });
  });
});

describe('continents', () => {
  it('accepts Oceania as an alias for Australia', () => {
    expect(classify('continents', 'Oceania')).toEqual({ valid: true, canonicalAnswer: 'Australia' });
  });
});

describe('months', () => {
  it('accepts common abbreviations', () => {
    expect(classify('months', 'Jan')).toEqual({ valid: true, canonicalAnswer: 'January' });
    expect(classify('months', 'sept')).toEqual({ valid: true, canonicalAnswer: 'September' });
  });
});

describe('number-1-10', () => {
  it('normalizes word forms', () => {
    expect(classify('number-1-10', 'one')).toEqual({ valid: true, canonicalAnswer: '1' });
    expect(classify('number-1-10', 'Ten')).toEqual({ valid: true, canonicalAnswer: '10' });
  });

  it('rejects non-whole numbers', () => {
    expect(classify('number-1-10', '5.5')).toEqual({ valid: false });
  });

  it('rejects out-of-range numbers', () => {
    expect(classify('number-1-10', '11')).toEqual({ valid: false });
    expect(classify('number-1-10', '0')).toEqual({ valid: false });
  });
});

describe('metro-manila-city', () => {
  it('accepts aliases and diacritic-free spellings', () => {
    expect(classify('metro-manila-city', 'QC')).toEqual({ valid: true, canonicalAnswer: 'Quezon City' });
    expect(classify('metro-manila-city', 'Q.C.')).toEqual({ valid: true, canonicalAnswer: 'Quezon City' });
    expect(classify('metro-manila-city', 'Las Pinas')).toEqual({ valid: true, canonicalAnswer: 'Las Piñas' });
    expect(classify('metro-manila-city', 'Paranaque')).toEqual({ valid: true, canonicalAnswer: 'Parañaque' });
    expect(classify('metro-manila-city', 'Parañaque')).toEqual({ valid: true, canonicalAnswer: 'Parañaque' });
  });

  it('explicitly rejects Pateros, Metro Manila, and NCR', () => {
    expect(classify('metro-manila-city', 'Pateros')).toEqual({ valid: false });
    expect(classify('metro-manila-city', 'Metro Manila')).toEqual({ valid: false });
    expect(classify('metro-manila-city', 'NCR')).toEqual({ valid: false });
  });
});

describe('straw-hat-pirates', () => {
  it('accepts short aliases', () => {
    expect(classify('straw-hat-pirates', 'Luffy')).toEqual({
      valid: true,
      canonicalAnswer: 'Monkey D. Luffy',
    });
    expect(classify('straw-hat-pirates', 'Jinbei')).toEqual({ valid: true, canonicalAnswer: 'Jinbe' });
  });

  it('rejects honorary/non-current members', () => {
    expect(classify('straw-hat-pirates', 'Yamato')).toEqual({ valid: false });
  });
});

describe('canadian-province', () => {
  it('accepts abbreviations', () => {
    expect(classify('canadian-province', 'BC')).toEqual({ valid: true, canonicalAnswer: 'British Columbia' });
    expect(classify('canadian-province', 'PEI')).toEqual({
      valid: true,
      canonicalAnswer: 'Prince Edward Island',
    });
  });

  it('rejects the territories', () => {
    expect(classify('canadian-province', 'Yukon')).toEqual({ valid: false });
    expect(classify('canadian-province', 'Nunavut')).toEqual({ valid: false });
    expect(classify('canadian-province', 'Northwest Territories')).toEqual({ valid: false });
  });
});

describe('asean-country', () => {
  it('accepts long-form aliases', () => {
    expect(classify('asean-country', 'Brunei Darussalam')).toEqual({ valid: true, canonicalAnswer: 'Brunei' });
    expect(classify('asean-country', 'Lao PDR')).toEqual({ valid: true, canonicalAnswer: 'Laos' });
    expect(classify('asean-country', 'Viet Nam')).toEqual({ valid: true, canonicalAnswer: 'Vietnam' });
  });
});

describe('every prompt has a valid, consistent hostAnswer', () => {
  for (const [id, def] of PROMPTS_BY_ID) {
    it(`${id}: hostAnswer classifies as itself`, () => {
      expect(classify(id, def.hostAnswer)).toEqual({ valid: true, canonicalAnswer: def.hostAnswer });
    });
  }
});
