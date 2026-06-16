import { isPositionEmpty } from '../board/occupancy';
import { isInsideBoard, offsetPosition } from '../board/position';
import type { Direction, Match } from '../types/game';
import type { ActionResolution } from './actionResult';
import { findLivingCell, replaceCell, withCells } from './updateCell';

export function resolveReproduce(
  match: Match,
  cellId: string,
  direction: Direction,
  currentTurn: number,
): ActionResolution {
  const parent = findLivingCell(match, cellId);
  if (!parent) {
    return { match, status: 'invalid', message: 'Cell is not alive.' };
  }

  const destination = offsetPosition(parent.position, direction);
  const invalidParent = {
    ...parent,
    lastAction: `r${direction}`,
    lastActionStatus: 'invalid' as const,
  };

  if (!isInsideBoard(destination) || !isPositionEmpty(match.board, destination)) {
    return {
      match: replaceCell(match, invalidParent),
      status: 'invalid',
      message: 'Reproduction destination is outside or occupied.',
    };
  }

  const childHealth = Math.floor(parent.health / 2);
  const parentHealth = parent.health - childHealth;
  const updatedParent = {
    ...parent,
    health: parentHealth,
    lastAction: `r${direction}`,
    lastActionStatus: 'success' as const,
  };
  const newborn = {
    id: `${parent.teamId}-cell-${currentTurn}-${match.board.cells.length + 1}`,
    teamId: parent.teamId,
    color: parent.color,
    position: destination,
    health: childHealth,
    isAlive: childHealth > 0,
    creationTurn: currentTurn,
    lastAction: 'born',
    lastActionStatus: 'none' as const,
  };

  return {
    match: withCells(match, [...match.board.cells.map((cell) => (cell.id === parent.id ? updatedParent : cell)), newborn]),
    status: 'success',
  };
}
