import { MAX_HEALTH, REST_HEAL } from '../constants/gameConstants';
import type { Match } from '../types/game';
import type { ActionResolution } from './actionResult';
import { findLivingCell, replaceCell } from './updateCell';

export function resolveRest(match: Match, cellId: string): ActionResolution {
  const cell = findLivingCell(match, cellId);
  if (!cell) {
    return { match, status: 'invalid', message: 'Cell is not alive.' };
  }

  return {
    match: replaceCell(match, {
      ...cell,
      health: Math.min(MAX_HEALTH, cell.health + REST_HEAL),
      lastAction: 'd',
      lastActionStatus: 'success',
    }),
    status: 'success',
  };
}
