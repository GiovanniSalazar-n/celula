import { EAT_DAMAGE } from '../constants/gameConstants';
import { getCellAtPosition } from '../board/occupancy';
import { isInsideBoard, offsetPosition } from '../board/position';
import type { Direction, Match } from '../types/game';
import type { ActionResolution } from './actionResult';
import { findLivingCell, replaceCell, withCells } from './updateCell';

export function resolveEat(match: Match, cellId: string, direction: Direction): ActionResolution {
  const attacker = findLivingCell(match, cellId);
  if (!attacker) {
    return { match, status: 'invalid', message: 'Cell is not alive.' };
  }

  const targetPosition = offsetPosition(attacker.position, direction);
  const invalidAttacker = {
    ...attacker,
    lastAction: `a${direction}`,
    lastActionStatus: 'invalid' as const,
  };

  if (!isInsideBoard(targetPosition)) {
    return {
      match: replaceCell(match, invalidAttacker),
      status: 'invalid',
      message: 'Eat target is outside the board.',
    };
  }

  const target = getCellAtPosition(match.board, targetPosition);
  if (!target || target.teamId === attacker.teamId) {
    return {
      match: replaceCell(match, invalidAttacker),
      status: 'invalid',
      message: 'Eat target must be an adjacent enemy.',
    };
  }

  const damagedTarget = {
    ...target,
    health: Math.max(0, target.health - EAT_DAMAGE),
    isAlive: target.health - EAT_DAMAGE > 0,
  };
  const updatedAttacker = {
    ...attacker,
    lastAction: `a${direction}`,
    lastActionStatus: 'success' as const,
  };
  const cells = match.board.cells.map((cell) => {
    if (cell.id === attacker.id) return updatedAttacker;
    if (cell.id === target.id) return damagedTarget;
    return cell;
  });

  return {
    match: withCells(match, cells),
    status: 'success',
  };
}
