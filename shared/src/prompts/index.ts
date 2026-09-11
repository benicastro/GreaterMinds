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

/** All 15 prompts, in round order. */
export const PROMPT_REGISTRY: PromptDefinition[] = [
  number1To10, // Round 1 — Whole Number
  rainbowColor, // Round 2 — Rainbow Color
  worstMeetingDay, // Round 3 — Worst Meeting Day
  deleteAMonth, // Round 4 — Delete a Month
  greaterMindsLetter, // Round 5 — GREATER MINDS Letter
  planets, // Round 6 — Planet
  starterPokemon, // Round 7 — Gen I–III Starter Pokémon
  zodiacSigns, // Round 8 — Zodiac Sign
  cardRank, // Round 9 — Playing-Card Rank
  tetromino, // Round 10 — Tetromino
  metroManilaCity, // Round 11 — Metro Manila City
  canadianProvince, // Round 12 — Canadian Province
  aseanCountry, // Round 13 — ASEAN Country
  centralLuzonProvince, // Round 14 — Central Luzon Province
  phProvinceB, // Round 15 — Philippine Province Beginning With B
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
