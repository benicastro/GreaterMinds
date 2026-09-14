import { PromptDefinition } from '../types.js';

export const chessPiece: PromptDefinition = {
  id: 'chess-piece',
  category: 'Chess Piece',
  promptText: 'Name a chess piece.',
  canonicalAnswers: ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'],
  aliases: {
    Castle: 'Rook',
    Horse: 'Knight',
  },
  hostAnswer: 'Bishop',
};
