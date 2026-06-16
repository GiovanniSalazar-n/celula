import { createBoard } from '../board/createBoard';
import type { Cell, Match } from '../types/game';

export function findLivingCell(match: Match, cellId: string): Cell | undefined {
  return match.board.cells.find((cell) => cell.id === cellId && cell.isAlive);
}

export function withCells(match: Match, cells: readonly Cell[]): Match {
  return {
    ...match,
    board: createBoard(cells.filter((cell) => cell.isAlive && cell.health > 0)),
  };
}

export function replaceCell(match: Match, updatedCell: Cell): Match {
  return withCells(
    match,
    match.board.cells.map((cell) => (cell.id === updatedCell.id ? updatedCell : cell)),
  );
}
