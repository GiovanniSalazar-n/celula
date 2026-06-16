import { NEIGHBOR_STATES } from '../constants/gameConstants';
import type { CellFunctionArgs, NeighborState } from '../types/game';

const allowedNeighborStates = new Set<string>(NEIGHBOR_STATES);

export function buildFunctionArgs(health: number, nearby: readonly string[]): CellFunctionArgs {
  if (nearby.length !== 8) {
    throw new Error('nearby must contain exactly 8 neighbor states.');
  }

  if (!nearby.every((state) => allowedNeighborStates.has(state))) {
    throw new Error('nearby must contain only empty, allied, enemy, or outside states.');
  }

  return Object.freeze({
    health,
    nearby: Object.freeze([...nearby]) as readonly NeighborState[],
  });
}
