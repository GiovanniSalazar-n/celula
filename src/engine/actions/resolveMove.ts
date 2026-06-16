import { getCellAtPosition, isPositionEmpty } from '../board/occupancy';
import { isInsideBoard, offsetPosition } from '../board/position';
import type { Direction } from '../types/game';
import type { ActionResolution } from './actionResult';
import { findLivingCell, replaceCell } from './updateCell';

export function resolveMove(match: ActionResolution['match'], cellId: string, direction: Direction): ActionResolution {
  const cell = findLivingCell(match, cellId);
  if (!cell) {
    return { match, status: 'invalid', message: 'Cell is not alive.' };
  }

  const destination = offsetPosition(cell.position, direction);
  if (!isInsideBoard(destination) || !isPositionEmpty(match.board, destination)) {
    const updatedMatch = replaceCell(match, {
      ...cell,
      lastAction: `m${direction}`,
      lastActionStatus: 'invalid',
    });

    return { match: updatedMatch, status: 'invalid', message: 'Move destination is outside or occupied.' };
  }

  const updatedMatch = replaceCell(match, {
    ...cell,
    position: destination,
    lastAction: `m${direction}`,
    lastActionStatus: 'success',
  });

  return { match: updatedMatch, status: 'success' };
}
