import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  MAX_HEALTH,
  SIMULATION_SPEEDS,
  TURN_LIMIT,
} from '../constants/gameConstants';
import { createBoard } from '../board/createBoard';
import { positionKey } from '../board/position';
import type { Cell, Match, Player, Position } from '../types/game';

export interface CreateInitialMatchOptions {
  random?: () => number;
}

export function createInitialMatch(
  players: readonly [Player, Player],
  options: CreateInitialMatchOptions = {},
): Match {
  const random = options.random ?? Math.random;
  const usedPositions = new Set<string>();

  const cells: Cell[] = players.map((player) => {
    const position = randomDistinctPosition(random, usedPositions);

    return {
      id: `${player.id}-cell-1`,
      teamId: player.id,
      color: player.color,
      position,
      health: MAX_HEALTH,
      isAlive: true,
      creationTurn: 1,
      lastActionStatus: 'none',
      lastAction: 'none',
    };
  });

  return {
    players,
    board: createBoard(cells),
    currentTurn: 1,
    turnLimit: TURN_LIMIT,
    status: 'paused',
    isLocked: true,
    errors: [],
    simulationSpeed: SIMULATION_SPEEDS[1],
  };
}

function randomDistinctPosition(random: () => number, usedPositions: Set<string>): Position {
  for (let attempts = 0; attempts < 100; attempts += 1) {
    const position = {
      row: Math.floor(random() * BOARD_ROWS),
      column: Math.floor(random() * BOARD_COLUMNS),
    };
    const key = positionKey(position);

    if (!usedPositions.has(key)) {
      usedPositions.add(key);
      return position;
    }
  }

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      const position = { row, column };
      const key = positionKey(position);

      if (!usedPositions.has(key)) {
        usedPositions.add(key);
        return position;
      }
    }
  }

  throw new Error('Unable to place initial cells on distinct squares.');
}
