import { PromptDefinition } from '../types.js';
import { number1To10 } from './number-1-10.js';
import { rainbowColor } from './rainbow-color.js';
import { worstMeetingDay } from './worst-meeting-day.js';
import { deleteAMonth } from './delete-a-month.js';
import { greaterMindsLetter } from './greater-minds-letter.js';
import { planets } from './planets.js';
import { starterPokemon } from './starter-pokemon.js';
import { zodiacSigns } from './zodiac-signs.js';
import { cardRank } from './card-rank.js';
import { tetromino } from './tetromino.js';
import { metroManilaCity } from './metro-manila-city.js';
import { canadianProvince } from './canadian-province.js';
import { aseanCountry } from './asean-country.js';
import { centralLuzonProvince } from './central-luzon-province.js';
import { phProvinceB } from './ph-province-b.js';

/**
 * All 15 prompts, in round order — sorted by number of valid answers, descending, so the
 * answer space gradually narrows over the game (better for spectator-friendly elimination play).
 */
export const PROMPT_REGISTRY: PromptDefinition[] = [
  metroManilaCity, // Round 1 — Metro Manila City (16)
  cardRank, // Round 2 — Playing-Card Rank (13)
  deleteAMonth, // Round 3 — Delete a Month (12)
  zodiacSigns, // Round 4 — Zodiac Sign (12)
  aseanCountry, // Round 5 — ASEAN Country (11)
  number1To10, // Round 6 — Whole Number (10)
  greaterMindsLetter, // Round 7 — GREATER MINDS Letter (10)
  canadianProvince, // Round 8 — Canadian Province (10)
  starterPokemon, // Round 9 — Gen I–III Starter Pokémon (9)
  phProvinceB, // Round 10 — Philippine Province Beginning With B (9)
  planets, // Round 11 — Planet (8)
  rainbowColor, // Round 12 — Rainbow Color (7)
  worstMeetingDay, // Round 13 — Worst Meeting Day (7)
  centralLuzonProvince, // Round 14 — Central Luzon Province (7)
  tetromino, // Round 15 — Tetromino (7)
];

export const PROMPTS_BY_ID: Map<string, PromptDefinition> = new Map(
  PROMPT_REGISTRY.map((prompt) => [prompt.id, prompt]),
);

export {
  number1To10,
  rainbowColor,
  worstMeetingDay,
  deleteAMonth,
  greaterMindsLetter,
  planets,
  starterPokemon,
  zodiacSigns,
  cardRank,
  tetromino,
  metroManilaCity,
  canadianProvince,
  aseanCountry,
  centralLuzonProvince,
  phProvinceB,
};
