import { describe, expect, it } from 'vitest';
import { compilePrompt, classifyAnswer } from './engine.js';
import { PROMPTS_BY_ID } from '../prompts/index.js';
import { PH_PROVINCES } from '../data/ph-provinces.js';

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

describe('ph-province', () => {
  it('has exactly the 82 official provinces, no duplicates', () => {
    expect(PH_PROVINCES.length).toBe(82);
    expect(new Set(PH_PROVINCES).size).toBe(82);
  });

  it('accepts provinces from a range of regions', () => {
    expect(classify('ph-province', 'rizal')).toEqual({ valid: true, canonicalAnswer: 'Rizal' });
    expect(classify('ph-province', 'Sulu')).toEqual({ valid: true, canonicalAnswer: 'Sulu' });
    expect(classify('ph-province', 'benguet')).toEqual({ valid: true, canonicalAnswer: 'Benguet' });
    expect(classify('ph-province', 'Maguindanao del Sur')).toEqual({
      valid: true,
      canonicalAnswer: 'Maguindanao del Sur',
    });
  });

  it('accepts renamed/legacy province name aliases', () => {
    expect(classify('ph-province', 'Compostela Valley')).toEqual({ valid: true, canonicalAnswer: 'Davao de Oro' });
    expect(classify('ph-province', 'Western Samar')).toEqual({ valid: true, canonicalAnswer: 'Samar' });
    expect(classify('ph-province', 'North Cotabato')).toEqual({ valid: true, canonicalAnswer: 'Cotabato' });
    expect(classify('ph-province', 'Mindoro Occidental')).toEqual({
      valid: true,
      canonicalAnswer: 'Occidental Mindoro',
    });
  });

  it('rejects regions and cities that are not provinces', () => {
    expect(classify('ph-province', 'Metro Manila')).toEqual({ valid: false });
    expect(classify('ph-province', 'NCR')).toEqual({ valid: false });
    expect(classify('ph-province', 'Quezon City')).toEqual({ valid: false });
  });

  it('does not resolve the ambiguous pre-split "Maguindanao" name', () => {
    expect(classify('ph-province', 'Maguindanao')).toEqual({ valid: false });
  });
});

describe('asean-country', () => {
  it('accepts long-form aliases', () => {
    expect(classify('asean-country', 'Brunei Darussalam')).toEqual({ valid: true, canonicalAnswer: 'Brunei' });
    expect(classify('asean-country', 'Lao PDR')).toEqual({ valid: true, canonicalAnswer: 'Laos' });
    expect(classify('asean-country', 'Viet Nam')).toEqual({ valid: true, canonicalAnswer: 'Vietnam' });
  });
});

describe('ph-region', () => {
  it('accepts common names and numbered-region aliases', () => {
    expect(classify('ph-region', 'Metro Manila')).toEqual({ valid: true, canonicalAnswer: 'NCR' });
    expect(classify('ph-region', 'Region 1')).toEqual({ valid: true, canonicalAnswer: 'Ilocos Region' });
    expect(classify('ph-region', 'Region III')).toEqual({ valid: true, canonicalAnswer: 'Central Luzon' });
    expect(classify('ph-region', 'Region 4-A')).toEqual({ valid: true, canonicalAnswer: 'CALABARZON' });
    expect(classify('ph-region', 'Region IV-B')).toEqual({ valid: true, canonicalAnswer: 'MIMAROPA' });
    expect(classify('ph-region', 'Bangsamoro')).toEqual({ valid: true, canonicalAnswer: 'BARMM' });
    expect(classify('ph-region', 'ARMM')).toEqual({ valid: true, canonicalAnswer: 'BARMM' });
  });

  it('does not resolve the ambiguous bare "Region 4"', () => {
    expect(classify('ph-region', 'Region 4')).toEqual({ valid: false });
    expect(classify('ph-region', 'Region IV')).toEqual({ valid: false });
  });
});

describe('harry-potter-house', () => {
  it('accepts all four houses', () => {
    expect(classify('harry-potter-house', 'slytherin')).toEqual({ valid: true, canonicalAnswer: 'Slytherin' });
  });

  it('rejects a non-house', () => {
    expect(classify('harry-potter-house', 'Durmstrang')).toEqual({ valid: false });
  });
});

describe('infinity-stone', () => {
  it('accepts the bare color-word alias', () => {
    expect(classify('infinity-stone', 'Time')).toEqual({ valid: true, canonicalAnswer: 'Time Stone' });
    expect(classify('infinity-stone', 'soul')).toEqual({ valid: true, canonicalAnswer: 'Soul Stone' });
  });

  it('accepts the full canonical form', () => {
    expect(classify('infinity-stone', 'Power Stone')).toEqual({ valid: true, canonicalAnswer: 'Power Stone' });
  });
});

describe('card-suit', () => {
  it('accepts singular-form aliases', () => {
    expect(classify('card-suit', 'Spade')).toEqual({ valid: true, canonicalAnswer: 'Spades' });
    expect(classify('card-suit', 'heart')).toEqual({ valid: true, canonicalAnswer: 'Hearts' });
  });

  it('rejects a non-suit', () => {
    expect(classify('card-suit', 'Jokers')).toEqual({ valid: false });
  });
});

describe('friends-character', () => {
  it('accepts first-name aliases', () => {
    expect(classify('friends-character', 'ross')).toEqual({ valid: true, canonicalAnswer: 'Ross Geller' });
    expect(classify('friends-character', 'Phoebe')).toEqual({ valid: true, canonicalAnswer: 'Phoebe Buffay' });
  });

  it('accepts full canonical names', () => {
    expect(classify('friends-character', 'Joey Tribbiani')).toEqual({ valid: true, canonicalAnswer: 'Joey Tribbiani' });
  });

  it('rejects a non-main-cast character', () => {
    expect(classify('friends-character', 'Gunther')).toEqual({ valid: false });
    expect(classify('friends-character', 'Janice')).toEqual({ valid: false });
  });

  it('does not resolve the ambiguous shared surname "Geller"', () => {
    expect(classify('friends-character', 'Geller')).toEqual({ valid: false });
  });
});

describe('every prompt has a valid, consistent hostAnswer', () => {
  for (const [id, def] of PROMPTS_BY_ID) {
    it(`${id}: hostAnswer classifies as itself`, () => {
      expect(classify(id, def.hostAnswer)).toEqual({ valid: true, canonicalAnswer: def.hostAnswer });
    });
  }
});
