import { describe, expect, it } from 'vitest';
import { compilePrompt, classifyAnswer } from './engine.js';
import { PROMPTS_BY_ID } from '../prompts/index.js';

function classify(promptId: string, raw: string) {
  const def = PROMPTS_BY_ID.get(promptId);
  if (!def) throw new Error(`unknown prompt ${promptId}`);
  return classifyAnswer(compilePrompt(def), raw);
}

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

describe('worst-meeting-day', () => {
  it('accepts all seven days', () => {
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      expect(classify('worst-meeting-day', day)).toEqual({ valid: true, canonicalAnswer: day });
    }
  });

  it('rejects a non-day', () => {
    expect(classify('worst-meeting-day', 'Someday')).toEqual({ valid: false });
  });
});

describe('delete-a-month', () => {
  it('accepts common abbreviations', () => {
    expect(classify('delete-a-month', 'Jan')).toEqual({ valid: true, canonicalAnswer: 'January' });
    expect(classify('delete-a-month', 'sept')).toEqual({ valid: true, canonicalAnswer: 'September' });
  });
});

describe('greater-minds-letter', () => {
  it('accepts a unique letter of GREATER MINDS case-insensitively', () => {
    expect(classify('greater-minds-letter', 'g')).toEqual({ valid: true, canonicalAnswer: 'G' });
    expect(classify('greater-minds-letter', 'S')).toEqual({ valid: true, canonicalAnswer: 'S' });
  });

  it('rejects a letter not in GREATER MINDS', () => {
    expect(classify('greater-minds-letter', 'B')).toEqual({ valid: false });
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

describe('starter-pokemon', () => {
  it('has exactly the 9 Gen I-III starters', () => {
    expect(PROMPTS_BY_ID.get('starter-pokemon')!.canonicalAnswers.length).toBe(9);
  });

  it('accepts a real starter', () => {
    expect(classify('starter-pokemon', 'squirtle')).toEqual({ valid: true, canonicalAnswer: 'Squirtle' });
  });

  it('rejects a later-gen starter', () => {
    expect(classify('starter-pokemon', 'Chespin')).toEqual({ valid: false });
  });
});

describe('card-rank', () => {
  it('accepts short aliases', () => {
    expect(classify('card-rank', 'A')).toEqual({ valid: true, canonicalAnswer: 'Ace' });
    expect(classify('card-rank', 'j')).toEqual({ valid: true, canonicalAnswer: 'Jack' });
    expect(classify('card-rank', 'Q')).toEqual({ valid: true, canonicalAnswer: 'Queen' });
    expect(classify('card-rank', 'k')).toEqual({ valid: true, canonicalAnswer: 'King' });
  });

  it('accepts numeric ranks', () => {
    expect(classify('card-rank', '10')).toEqual({ valid: true, canonicalAnswer: '10' });
  });

  it('rejects a suit', () => {
    expect(classify('card-rank', 'Spades')).toEqual({ valid: false });
  });
});

describe('tetromino', () => {
  it('normalizes lowercase letters', () => {
    expect(classify('tetromino', 't')).toEqual({ valid: true, canonicalAnswer: 'T' });
  });

  it('rejects a non-tetromino letter', () => {
    expect(classify('tetromino', 'X')).toEqual({ valid: false });
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
    expect(classify('asean-country', 'East Timor')).toEqual({ valid: true, canonicalAnswer: 'Timor-Leste' });
  });

  it('has all 11 current members', () => {
    expect(PROMPTS_BY_ID.get('asean-country')!.canonicalAnswers.length).toBe(11);
  });
});

describe('chess-piece', () => {
  it('has all 6 pieces', () => {
    expect(PROMPTS_BY_ID.get('chess-piece')!.canonicalAnswers.length).toBe(6);
  });

  it('accepts the "Castle" alias for Rook', () => {
    expect(classify('chess-piece', 'castle')).toEqual({ valid: true, canonicalAnswer: 'Rook' });
  });

  it('rejects a non-piece', () => {
    expect(classify('chess-piece', 'Dragon')).toEqual({ valid: false });
  });
});

describe('compass-direction', () => {
  it('has all 4 cardinal directions', () => {
    expect(PROMPTS_BY_ID.get('compass-direction')!.canonicalAnswers.length).toBe(4);
  });

  it('accepts single-letter aliases', () => {
    expect(classify('compass-direction', 'n')).toEqual({ valid: true, canonicalAnswer: 'North' });
    expect(classify('compass-direction', 'W')).toEqual({ valid: true, canonicalAnswer: 'West' });
  });

  it('rejects an intercardinal direction', () => {
    expect(classify('compass-direction', 'Northeast')).toEqual({ valid: false });
  });
});

describe('season', () => {
  it('has all 4 seasons', () => {
    expect(PROMPTS_BY_ID.get('season')!.canonicalAnswers.length).toBe(4);
  });

  it('accepts "Fall" as an alias for Autumn', () => {
    expect(classify('season', 'fall')).toEqual({ valid: true, canonicalAnswer: 'Autumn' });
  });

  it('rejects a non-season', () => {
    expect(classify('season', 'Monsoon')).toEqual({ valid: false });
  });
});

describe('taylor-swift-album', () => {
  it('has all 11 studio albums', () => {
    expect(PROMPTS_BY_ID.get('taylor-swift-album')!.canonicalAnswers.length).toBe(11);
  });

  it('accepts a canonical album title', () => {
    expect(classify('taylor-swift-album', 'folklore')).toEqual({ valid: true, canonicalAnswer: 'Folklore' });
  });

  it('normalizes "(Taylor\'s Version)" re-recordings to the original studio album', () => {
    expect(classify('taylor-swift-album', "1989 (Taylor's Version)")).toEqual({
      valid: true,
      canonicalAnswer: '1989',
    });
    expect(classify('taylor-swift-album', 'Red TV')).toEqual({ valid: true, canonicalAnswer: 'Red' });
    expect(classify('taylor-swift-album', "Fearless (Taylor's Version)")).toEqual({
      valid: true,
      canonicalAnswer: 'Fearless',
    });
    expect(classify('taylor-swift-album', 'Speak Now (TV)')).toEqual({
      valid: true,
      canonicalAnswer: 'Speak Now',
    });
  });

  it('rejects a non-album', () => {
    expect(classify('taylor-swift-album', 'Cardigan')).toEqual({ valid: false });
  });
});

describe('central-luzon-province', () => {
  it('has exactly the 7 Central Luzon provinces', () => {
    expect(PROMPTS_BY_ID.get('central-luzon-province')!.canonicalAnswers.length).toBe(7);
  });

  it('accepts a real province', () => {
    expect(classify('central-luzon-province', 'pampanga')).toEqual({ valid: true, canonicalAnswer: 'Pampanga' });
  });

  it('rejects a province from another region', () => {
    expect(classify('central-luzon-province', 'Cebu')).toEqual({ valid: false });
  });
});

describe('ph-province-b', () => {
  it('has exactly the 9 provinces beginning with B', () => {
    expect(PROMPTS_BY_ID.get('ph-province-b')!.canonicalAnswers.length).toBe(9);
  });

  it('accepts a real province', () => {
    expect(classify('ph-province-b', 'bohol')).toEqual({ valid: true, canonicalAnswer: 'Bohol' });
  });

  it('rejects a province not beginning with B', () => {
    expect(classify('ph-province-b', 'Cebu')).toEqual({ valid: false });
  });
});

describe('every prompt has a valid, consistent hostAnswer', () => {
  for (const [id, def] of PROMPTS_BY_ID) {
    it(`${id}: hostAnswer classifies as itself`, () => {
      expect(classify(id, def.hostAnswer)).toEqual({ valid: true, canonicalAnswer: def.hostAnswer });
    });
  }
});
