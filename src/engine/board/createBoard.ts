import { BOARD_COLUMNS, BOARD_ROWS } from '../constants/gameConstants';
import type { Board, Cell, OccupancyKey } from '../types/game';
import { isInsideBoard, positionKey } from './position';

export function createBoard(cells: readonly Cell[] = []): Board {
  const occupancy = new Map<OccupancyKey, string>();

  for (const cell of cells) {
    if (!cell.isAlive) {
      continue;
    }

    if (!isInsideBoard(cell.position)) {
      throw new Error('Living cell position must be inside the board.');
    }

    const key = positionKey(cell.position);
    if (occupancy.has(key)) {
      throw new Error('Multiple living cells cannot occupy the same square.');
    }

    occupancy.set(key, cell.id);
  }

  return {
    rows: BOARD_ROWS,
    columns: BOARD_COLUMNS,
    cells: [...cells],
    occupancy,
  };
}
