import { PromptDefinition } from '../types.js';
import { rainbowColor } from './rainbow-color.js';
import { starterPokemon } from './starter-pokemon.js';
import { planets } from './planets.js';
import { continents } from './continents.js';
import { daysOfWeek } from './days-of-week.js';
import { months } from './months.js';
import { zodiacSigns } from './zodiac-signs.js';
import { number1To10 } from './number-1-10.js';
import { metroManilaCity } from './metro-manila-city.js';
import { phProvince } from './ph-province.js';
import { strawHatPirates } from './straw-hat-pirates.js';
import { chessPiece } from './chess-piece.js';
import { phVicePresidents } from './ph-vice-presidents.js';
import { canadianProvince } from './canadian-province.js';
import { aseanCountry } from './asean-country.js';

/** All 15 prompts, in design-doc order. */
export const PROMPT_REGISTRY: PromptDefinition[] = [
  rainbowColor,
  starterPokemon,
  planets,
  continents,
  daysOfWeek,
  months,
  zodiacSigns,
  number1To10,
  metroManilaCity,
  phProvince,
  strawHatPirates,
  chessPiece,
  phVicePresidents,
  canadianProvince,
  aseanCountry,
];

export const PROMPTS_BY_ID: Map<string, PromptDefinition> = new Map(
  PROMPT_REGISTRY.map((prompt) => [prompt.id, prompt]),
);

export {
  rainbowColor,
  starterPokemon,
  planets,
  continents,
  daysOfWeek,
  months,
  zodiacSigns,
  number1To10,
  metroManilaCity,
  phProvince,
  strawHatPirates,
  chessPiece,
  phVicePresidents,
  canadianProvince,
  aseanCountry,
};
