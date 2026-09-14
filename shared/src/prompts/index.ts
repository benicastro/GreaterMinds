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
import { taylorSwiftAlbum } from './taylor-swift-album.js';
import { chessPiece } from './chess-piece.js';
import { compassDirection } from './compass-direction.js';
import { season } from './season.js';

/**
 * All 19 prompts, in round order — sorted by number of valid answers, descending, so the
 * answer space gradually narrows over the game (better for spectator-friendly elimination play).
 * With adaptive round selection (see `Room.pickNextPromptId`), this order also determines which
 * prompts land in the tightest, latest-game tier when the active field is small.
 */
export const PROMPT_REGISTRY: PromptDefinition[] = [
  metroManilaCity, // Metro Manila City (16)
  cardRank, // Playing-Card Rank (13)
  deleteAMonth, // Delete a Month (12)
  zodiacSigns, // Zodiac Sign (12)
  taylorSwiftAlbum, // Taylor Swift Studio Album (12)
  aseanCountry, // ASEAN Country (11)
  number1To10, // Whole Number (10)
  greaterMindsLetter, // GREATER MINDS Letter (10)
  canadianProvince, // Canadian Province (10)
  starterPokemon, // Gen I–III Starter Pokémon (9)
  phProvinceB, // Philippine Province Beginning With B (9)
  planets, // Planet (8)
  rainbowColor, // Rainbow Color (7)
  worstMeetingDay, // Worst Meeting Day (7)
  centralLuzonProvince, // Central Luzon Province (7)
  tetromino, // Tetromino (7)
  chessPiece, // Chess Piece (6)
  compassDirection, // Compass Direction (4)
  season, // Season (4)
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
  taylorSwiftAlbum,
  chessPiece,
  compassDirection,
  season,
};
