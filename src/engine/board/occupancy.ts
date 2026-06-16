import type { Board, Cell, Position } from '../types/game';
import { isInsideBoard, positionKey } from './position';

export function getCellAtPosition(board: Board, position: Position): Cell | undefined {
  const cellId = board.occupancy.get(positionKey(position));
  if (!cellId) {
    return undefined;
  }

  return board.cells.find((cell) => cell.id === cellId && cell.isAlive);
}

export function isPositionEmpty(board: Board, position: Position): boolean {
  return isInsideBoard(position) && getCellAtPosition(board, position) === undefined;
}
