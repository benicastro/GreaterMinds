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
import { phRegion } from './ph-region.js';
import { harryPotterHouse } from './harry-potter-house.js';
import { infinityStone } from './infinity-stone.js';
import { cardSuit } from './card-suit.js';
import { friendsCharacter } from './friends-character.js';

/**
 * All 20 prompts, ordered by number of accepted canonical answers, descending
 * (ties broken by the original design-doc/addition order): ph-province (82) down to
 * harry-potter-house / card-suit (4 each).
 */
export const PROMPT_REGISTRY: PromptDefinition[] = [
  phProvince, // 82
  phRegion, // 17
  metroManilaCity, // 16
  months, // 12
  zodiacSigns, // 12
  phVicePresidents, // 12
  number1To10, // 10
  strawHatPirates, // 10
  canadianProvince, // 10
  aseanCountry, // 10
  starterPokemon, // 9
  planets, // 8
  rainbowColor, // 7
  continents, // 7
  daysOfWeek, // 7
  chessPiece, // 6
  infinityStone, // 6
  friendsCharacter, // 6
  harryPotterHouse, // 4
  cardSuit, // 4
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
  phRegion,
  harryPotterHouse,
  infinityStone,
  cardSuit,
  friendsCharacter,
};
