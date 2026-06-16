import { BOARD_COLUMNS, BOARD_ROWS } from '../constants/gameConstants';
import type { Direction, OccupancyKey, Position } from '../types/game';

const DIRECTION_OFFSETS: Record<Direction, { row: number; column: number }> = {
  n: { row: -1, column: 0 },
  s: { row: 1, column: 0 },
  e: { row: 0, column: 1 },
  w: { row: 0, column: -1 },
  ne: { row: -1, column: 1 },
  nw: { row: -1, column: -1 },
  se: { row: 1, column: 1 },
  sw: { row: 1, column: -1 },
};

export function positionKey(position: Position): OccupancyKey {
  return `${position.row},${position.column}`;
}

export function isInsideBoard(position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < BOARD_ROWS &&
    position.column >= 0 &&
    position.column < BOARD_COLUMNS
  );
}

export function offsetPosition(position: Position, direction: Direction): Position {
  const offset = DIRECTION_OFFSETS[direction];
  return {
    row: position.row + offset.row,
    column: position.column + offset.column,
  };
}
